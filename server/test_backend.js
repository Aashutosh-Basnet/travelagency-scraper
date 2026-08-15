/**
 * Automated test suite for Blog Website Express backend
 * Verifies Auth (session + bcrypt), Posts CRUD, and authorization security
 */

const http = require('http');
const mongoose = require('mongoose');
const app = require('./server');

const PORT = 5555;
let server;
let baseUrl;

// Simple cookie jar
class CookieJar {
  constructor() {
    this.cookies = {};
  }

  saveCookies(setCookieHeader) {
    if (!setCookieHeader) return;
    const cookiesArray = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    cookiesArray.forEach((cookieStr) => {
      const parts = cookieStr.split(';')[0].split('=');
      if (parts.length >= 2) {
        this.cookies[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
  }

  getCookieHeader() {
    return Object.entries(this.cookies)
      .map(([name, val]) => `${name}=${val}`)
      .join('; ');
  }

  clear() {
    this.cookies = {};
  }
}

async function makeRequest(jar, method, path, body = null) {
  const url = new URL(path, baseUrl);

  const headers = {};
  const cookieHeader = jar.getCookieHeader();
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  let requestData = null;
  if (body) {
    requestData = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(requestData);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          if (res.headers['set-cookie']) {
            jar.saveCookies(res.headers['set-cookie']);
          }

          let json = {};
          try {
            json = JSON.parse(responseData);
          } catch (e) {
            json = { raw: responseData };
          }

          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: json,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (requestData) {
      req.write(requestData);
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('🚀 RUNNING BLOG BACKEND AUTOMATED TESTS');
  console.log('========================================\n');

  const jar1 = new CookieJar(); // Alice
  const jar2 = new CookieJar(); // Bob

  try {
    // 1. Health check
    console.log('Test 1: Server Health Check');
    const health = await makeRequest(jar1, 'GET', '/api/health');
    assert(health.status === 200, 'Health check returns 200');
    assert(health.data.status === 'ok', 'Health status is ok');

    // 2. Signup User 1 (Alice)
    console.log('\nTest 2: Signup User 1 (Alice)');
    const uniqueEmail1 = `alice_${Date.now()}@example.com`;
    const signupRes = await makeRequest(jar1, 'POST', '/api/auth/signup', {
      name: 'Alice Cooper',
      email: uniqueEmail1,
      password: 'password123',
    });
    assert(signupRes.status === 201, 'Signup returns 201 Created');
    assert(signupRes.data.user.email === uniqueEmail1, 'Returned user email matches');
    assert(!signupRes.data.user.passwordHash, 'passwordHash is NOT exposed in response');
    assert(jar1.cookies['connect.sid'], 'Session cookie connect.sid was set');

    // 3. Verify Session with /api/auth/me
    console.log('\nTest 3: Get Current User (/api/auth/me)');
    const meRes = await makeRequest(jar1, 'GET', '/api/auth/me');
    assert(meRes.status === 200, 'Auth me returns 200 OK');
    assert(meRes.data.user.name === 'Alice Cooper', 'User name is Alice Cooper');

    // 4. Create Post 1 (Published) for Alice
    console.log('\nTest 4: Create Published Post (Alice)');
    const post1Res = await makeRequest(jar1, 'POST', '/api/posts', {
      title: 'Building Scalable Web Apps',
      content: 'Here is a comprehensive guide to building modern full-stack web applications with Express and React.',
      tags: ['react', 'node', 'express'],
      status: 'published',
    });
    assert(post1Res.status === 201, 'Post creation returns 201');
    const alicePost1Id = post1Res.data.post._id;
    assert(alicePost1Id, 'Post ID is present');
    assert(post1Res.data.post.status === 'published', 'Post status is published');
    assert(post1Res.data.post.tags.length === 3, 'Post has 3 tags');

    // 5. Create Post 2 (Draft) for Alice
    console.log('\nTest 5: Create Draft Post (Alice)');
    const post2Res = await makeRequest(jar1, 'POST', '/api/posts', {
      title: 'Unfinished Draft Thoughts',
      content: 'This is some work in progress draft idea.',
      tags: ['drafts'],
      status: 'draft',
    });
    assert(post2Res.status === 201, 'Draft post created with 201');
    const aliceDraftId = post2Res.data.post._id;

    // 6. Signup User 2 (Bob)
    console.log('\nTest 6: Signup User 2 (Bob)');
    const uniqueEmail2 = `bob_${Date.now()}@example.com`;
    const signupBob = await makeRequest(jar2, 'POST', '/api/auth/signup', {
      name: 'Bob Marley',
      email: uniqueEmail2,
      password: 'password123',
    });
    assert(signupBob.status === 201, 'Bob signup returns 201');

    // 7. Isolation Check: Bob gets his posts
    console.log('\nTest 7: User Posts Isolation (Bob has 0 posts)');
    const bobPostsRes = await makeRequest(jar2, 'GET', '/api/posts');
    assert(bobPostsRes.status === 200, 'Bob posts query returns 200');
    assert(bobPostsRes.data.posts.length === 0, 'Bob receives 0 posts (Alice posts are strictly isolated)');

    // 8. Security & Authorization Check: Bob tries to edit or delete Alice\'s post
    console.log('\nTest 8: Authorization Enforcement (Bob tries to edit/delete Alice\'s post)');
    const unauthorizedEdit = await makeRequest(jar2, 'PUT', `/api/posts/${alicePost1Id}`, {
      title: 'Hacked Title',
    });
    assert(unauthorizedEdit.status === 403, 'Forbidden 403 when updating another user post');

    const unauthorizedDelete = await makeRequest(jar2, 'DELETE', `/api/posts/${alicePost1Id}`);
    assert(unauthorizedDelete.status === 403, 'Forbidden 403 when deleting another user post');

    // 9. Public Feed Check
    console.log('\nTest 9: Public Feed (Only published posts returned)');
    const feedRes = await makeRequest(jar2, 'GET', '/api/posts/public');
    assert(feedRes.status === 200, 'Public feed returns 200');
    const hasPublished = feedRes.data.posts.some((p) => p._id === alicePost1Id);
    const hasDraft = feedRes.data.posts.some((p) => p._id === aliceDraftId);
    assert(hasPublished, 'Published post is present in public feed');
    assert(!hasDraft, 'Draft post is NOT visible in public feed');

    // 10. Update Post by Owner (Alice)
    console.log('\nTest 10: Update Post (Alice)');
    const updateRes = await makeRequest(jar1, 'PUT', `/api/posts/${alicePost1Id}`, {
      title: 'Building Scalable Web Apps (Updated)',
      content: 'Updated comprehensive content.',
    });
    assert(updateRes.status === 200, 'Update returns 200 OK');
    assert(updateRes.data.post.title === 'Building Scalable Web Apps (Updated)', 'Title updated successfully');

    // 11. Delete Post by Owner (Alice deletes draft)
    console.log('\nTest 11: Delete Post (Alice deletes draft)');
    const deleteRes = await makeRequest(jar1, 'DELETE', `/api/posts/${aliceDraftId}`);
    assert(deleteRes.status === 200, 'Delete returns 200 OK');

    // 12. Logout
    console.log('\nTest 12: Logout Alice');
    const logoutRes = await makeRequest(jar1, 'POST', '/api/auth/logout');
    assert(logoutRes.status === 200, 'Logout returns 200 OK');

    const meAfterLogout = await makeRequest(jar1, 'GET', '/api/auth/me');
    assert(meAfterLogout.status === 401, '401 Unauthorized after session logout');

    console.log('\n========================================');
    console.log('🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!');
    console.log('========================================\n');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.connection.close();
    process.exit(process.exitCode || 0);
  }
}

// Start temporary test server
server = app.listen(PORT, () => {
  baseUrl = `http://localhost:${PORT}`;
  runTests();
});
