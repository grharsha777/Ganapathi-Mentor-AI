export default function RateLimitInfo() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', background: 'white', color: 'black', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: 'black', fontSize: '28px', marginBottom: '20px' }}>Email Rate Limit Information</h1>

      <section style={{ marginBottom: '30px', padding: '20px', background: '#f5f5f5', borderLeft: '4px solid #ff9800' }}>
        <h2 style={{ color: 'black', fontSize: '20px', marginTop: 0 }}>What is this error?</h2>
        <p style={{ color: 'black', fontSize: '14px', lineHeight: '1.6' }}>
          &quot;Email rate limit exceeded&quot; is a Supabase security feature that limits the number of signup/login attempts
          from the same email address to prevent abuse and unauthorized access attempts.
        </p>
      </section>

      <section style={{ marginBottom: '30px', padding: '20px', background: '#f5f5f5', borderLeft: '4px solid #ff9800' }}>
        <h2 style={{ color: 'black', fontSize: '20px', marginTop: 0 }}>How to fix it</h2>
        <ol style={{ color: 'black', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li><strong>Wait a few minutes (5-15 minutes)</strong> - The rate limit is temporary and will reset automatically</li>
          <li><strong>Use a different email address</strong> - Each email has its own rate limit counter</li>
          <li><strong>Check your Supabase settings</strong> - If you&apos;re self-hosting, you can adjust rate limit settings</li>
        </ol>
      </section>

      <section style={{ marginBottom: '30px', padding: '20px', background: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
        <h2 style={{ color: 'black', fontSize: '20px', marginTop: 0 }}>📧 For Testing</h2>
        <p style={{ color: 'black', fontSize: '14px', lineHeight: '1.6' }}>
          Use different email addresses for each test:
        </p>
        <ul style={{ color: 'black', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>test1@example.com</li>
          <li>test2@example.com</li>
          <li>test3@example.com</li>
          <li>And so on...</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px', padding: '20px', background: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
        <h2 style={{ color: 'black', fontSize: '20px', marginTop: 0 }}>ℹ️ Default Rate Limits</h2>
        <p style={{ color: 'black', fontSize: '14px', lineHeight: '1.6' }}>
          <strong>Free Tier (Supabase):</strong>
        </p>
        <ul style={{ color: 'black', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>4 signup attempts per hour per email</li>
          <li>10 login attempts per hour per email</li>
          <li>Resets after 1 hour of inactivity</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px', padding: '20px', background: '#fff3e0', borderLeft: '4px solid #ff6f00' }}>
        <h2 style={{ color: 'black', fontSize: '20px', marginTop: 0 }}>🔧 To Adjust Rate Limits (If Self-Hosted)</h2>
        <p style={{ color: 'black', fontSize: '14px', lineHeight: '1.6' }}>
          1. Go to your Supabase Dashboard<br />
          2. Navigate to Authentication → Providers → Email<br />
          3. Adjust &quot;Signup Rate Limit&quot; and &quot;Login Rate Limit&quot; settings<br />
          4. Save changes
        </p>
      </section>

      <section style={{ padding: '20px', background: '#f3e5f5', borderLeft: '4px solid #9c27b0' }}>
        <h2 style={{ color: 'black', fontSize: '20px', marginTop: 0 }}>✅ This is Normal</h2>
        <p style={{ color: 'black', fontSize: '14px', lineHeight: '1.6' }}>
          This error is expected behavior and shows that your Supabase authentication is working correctly with proper security measures in place!
        </p>
      </section>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <a href="/auth/login" style={{ padding: '12px 24px', background: 'black', color: 'white', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }}>Back to Login</a>
        <a href="/" style={{ padding: '12px 24px', background: '#f0f0f0', color: 'black', textDecoration: 'none', borderRadius: '4px', display: 'inline-block', marginLeft: '10px' }}>Home</a>
      </div>
    </div>
  )
}
