export default function Home() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', background: 'white', color: 'black' }}>
      <h1 style={{ color: 'black', fontSize: '32px', marginBottom: '20px' }}>Analytics Pro</h1>
      <p style={{ color: 'black', fontSize: '16px', marginBottom: '20px' }}>
        Welcome to Analytics Pro - Enterprise Dashboard
      </p>
      <nav style={{ marginBottom: '30px' }}>
        <a href="/auth/login" style={{ marginRight: '20px', padding: '10px 20px', background: '#f0f0f0', textDecoration: 'none', color: 'black', border: '1px solid #999' }}>Sign In</a>
        <a href="/auth/sign-up" style={{ padding: '10px 20px', background: 'black', textDecoration: 'none', color: 'white', border: '1px solid black' }}>Get Started</a>
      </nav>
      
      <section style={{ marginTop: '40px', maxWidth: '800px' }}>
        <h2 style={{ color: 'black', fontSize: '24px' }}>Features</h2>
        <ul style={{ color: 'black', fontSize: '14px', lineHeight: '1.8' }}>
          <li>Real-time metrics dashboard</li>
          <li>Team management and collaboration</li>
          <li>Alert notifications and tracking</li>
          <li>Data visualization with charts</li>
          <li>Secure authentication with Supabase</li>
          <li>Row-level database security</li>
        </ul>
      </section>

      <section style={{ marginTop: '40px', maxWidth: '800px' }}>
        <h2 style={{ color: 'black', fontSize: '24px' }}>Getting Started</h2>
        <p style={{ color: 'black', fontSize: '14px' }}>
          <a href="/auth/sign-up" style={{ color: 'blue', textDecoration: 'underline' }}>Create an account</a> to start using Analytics Pro.
          Already have an account? <a href="/auth/login" style={{ color: 'blue', textDecoration: 'underline' }}>Sign in here</a>.
        </p>
      </section>

      <section style={{ marginTop: '40px', maxWidth: '800px', padding: '20px', background: '#fff3e0', borderRadius: '8px' }}>
        <h2 style={{ color: '#ff6f00', fontSize: '18px' }}>ℹ️ Rate Limiting Note</h2>
        <p style={{ color: 'black', fontSize: '13px', marginBottom: '10px' }}>
          During testing, you may encounter "email rate limit exceeded" messages. This is a security feature.
          <a href="/rate-limit-info" style={{ color: 'blue', textDecoration: 'underline', marginLeft: '5px' }}>Learn more</a>
        </p>
        <p style={{ color: 'black', fontSize: '13px' }}>
          <strong>Quick fix:</strong> Wait a few minutes or use a different email address for testing.
        </p>
      </section>
    </div>
  )
}
