# 🌐 How to Share Your Blog Website with Friends

You can share your live blog website with friends over the internet using either **localtunnel** (instant, 0 install) or **ngrok**.

---

## 🚀 Option 1: Instant Tunnel (Zero Setup, Recommended)

In your terminal:
```powershell
cd C:\Users\Acer\.gemini\antigravity\scratch\blog-website
npm run share
```
*(Or double-click `start-tunnel.bat`)*

It will immediately give you a public HTTPS URL:
```
your url is: https://funny-otter-42.loca.lt
```
Send this link to your friends!

> **Note for friends visiting the `loca.lt` link:**
> When opening for the first time, click the friendly **"Click to Continue"** button on the screen to view your live blog!

---

## ⚡ Option 2: Official ngrok (Standalone)

If you prefer using official ngrok:

1. Install ngrok via Windows Package Manager:
   ```powershell
   winget install ngrok.ngrok
   ```
   *(Or download from [ngrok.com/download](https://ngrok.com/download))*

2. Set your free authtoken (from [dashboard.ngrok.com](https://dashboard.ngrok.com)):
   ```powershell
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

3. Run the tunnel:
   ```powershell
   ngrok http 5173
   ```
