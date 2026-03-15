import { Link } from 'react-router-dom'
import SwirlyBackground from '../components/SwirlyBackground'

function HomePage() {
  return (
    <>
      <div className="hero-zone">
        <SwirlyBackground />

        <section className="hero">
          <span className="version-badge">v0.3 Draft</span>
          <h1>PersonalNode Protocol</h1>
          <p className="subtitle">
            A federated, user-owned social data protocol. Own your data, control
            your keys, connect with anyone.
          </p>
          <Link to="/spec" className="hero-cta">
            Read the Full Spec &rarr;
          </Link>
        </section>

        <section className="section">
          <h2>Design Principles</h2>
          <div className="principles-grid">
            <div className="principle-card">
              <h3>You Own Your Data</h3>
              <p>Your node stores your data. No other node can modify it. You decide who sees what through explicit access controls.</p>
            </div>
            <div className="principle-card">
              <h3>You Control Your Keys</h3>
              <p>Your private key never leaves your device. The server never holds it. All encryption and signing happens client-side.</p>
            </div>
            <div className="principle-card">
              <h3>Trust is Explicit</h3>
              <p>No automatic or open federation. Every trust relationship is human-initiated through invite links shared out-of-band.</p>
            </div>
            <div className="principle-card">
              <h3>Read-Only Federation</h3>
              <p>Trusted parties can read your data but never modify it. Collaboration happens at the application layer, not the protocol.</p>
            </div>
            <div className="principle-card">
              <h3>Thin Protocol</h3>
              <p>The protocol defines discovery, trust, and data exchange. Implementations are free to build any experience on top.</p>
            </div>
            <div className="principle-card">
              <h3>Standard Formats</h3>
              <p>Standard JSON and REST. No exotic data formats, no custom binary protocols. Easy to implement in any language.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="section">
        <h2>Core Concepts</h2>
        <div className="concepts-list">
          <div className="concept-item">
            <div className="concept-icon">&#x1F5A5;</div>
            <div>
              <h3>Node</h3>
              <p>A server instance identified by a domain name (e.g., peter.social). A node can serve one user or many, and stores data, manages identity, and handles federation.</p>
            </div>
          </div>
          <div className="concept-item">
            <div className="concept-icon">&#x1F464;</div>
            <div>
              <h3>Identity</h3>
              <p>A user's identity is a URL: <code>https://&#123;node&#125;/users/&#123;username&#125;</code>. This resolves to a public profile document with display name, avatar, bio, and public key.</p>
            </div>
          </div>
          <div className="concept-item">
            <div className="concept-icon">&#x1F4C4;</div>
            <div>
              <h3>Resources</h3>
              <p>Any piece of user-owned data: posts, files, contacts, or custom types. Each resource has an owner, timestamps, and an Access Control List defining who can read it.</p>
            </div>
          </div>
          <div className="concept-item">
            <div className="concept-icon">&#x1F91D;</div>
            <div>
              <h3>Trust</h3>
              <p>A permissioned, read-only relationship between two users. Trust is initiated via invite links shared privately and grants scoped access to resources and optionally the inbox.</p>
            </div>
          </div>
          <div className="concept-item">
            <div className="concept-icon">&#x1F310;</div>
            <div>
              <h3>Federation</h3>
              <p>Server-to-server communication on behalf of users. Your node proxies requests to remote nodes using signed HTTP requests, keeping the client simple and secure.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>How Federation Works</h2>
        <div className="flow-steps">
          <div className="flow-step">
            <span className="step-number">1</span>
            <h3>Client Signs Request</h3>
            <p>Your client signs a federation fetch request with your private key and sends it to your node.</p>
          </div>
          <div className="flow-step">
            <span className="step-number">2</span>
            <h3>Node Verifies User</h3>
            <p>Your node verifies your signature against your public key stored in your profile.</p>
          </div>
          <div className="flow-step">
            <span className="step-number">3</span>
            <h3>Trust Token Check</h3>
            <p>Your node checks that you have a valid trust token for the requested resource on the remote node.</p>
          </div>
          <div className="flow-step">
            <span className="step-number">4</span>
            <h3>Server-Signed Outbound Request</h3>
            <p>Your node signs the outbound HTTP request with the server's private key and calls the remote node.</p>
          </div>
          <div className="flow-step">
            <span className="step-number">5</span>
            <h3>Remote Node Verifies</h3>
            <p>The remote node verifies the server signature, checks the trust token, and returns or denies the resource.</p>
          </div>
          <div className="flow-step">
            <span className="step-number">6</span>
            <h3>Client Decrypts Locally</h3>
            <p>Your node returns the encrypted resource. Your client decrypts it locally using your private key. The server never sees plaintext.</p>
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <h2>Read the Full Specification</h2>
        <p>Dive into identity, authentication, trust, resources, inbox, federation, and security requirements.</p>
        <Link to="/spec" className="hero-cta">
          View Specification &rarr;
        </Link>
      </section>
    </>
  )
}

export default HomePage
