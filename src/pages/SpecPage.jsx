function SpecPage() {
  return (
    <div className="spec-page">
      <h1>PersonalNode Protocol</h1>
      <p className="spec-meta">Specification v0.3 (Draft) &mdash; A federated, user-owned social data protocol</p>

      {/* 1. Overview */}
      <h2>1. Overview</h2>
      <p>
        PersonalNode is an open protocol for federated, user-owned social data. The core premise is
        that every person should own their own data, control who can see it, and be able to connect
        with others on different servers without depending on any central platform.
      </p>
      <p>
        A PersonalNode is a server that you or a host provider runs on your behalf. It stores your data,
        manages your identity, handles authentication, and communicates with other PersonalNode
        servers on your behalf. The protocol defines how nodes discover each other, establish trust, and
        exchange data — nothing more.
      </p>

      {/* 2. Design Principles */}
      <h2>2. Design Principles</h2>
      <ul>
        <li>Your node owns your data. No other node can modify your data.</li>
        <li>You control your keys. The server never holds your private key.</li>
        <li>Trust is explicit and human-initiated. No automatic or open federation.</li>
        <li>Everything is read-only federation. Collaboration happens at the application layer.</li>
        <li>The protocol is thin. Implementations are free to add features on top.</li>
        <li>Standard JSON and REST. No exotic data formats required.</li>
      </ul>

      {/* 3. Core Concepts */}
      <h2>3. Core Concepts</h2>

      <h3>3.1 Node</h3>
      <p>
        A node is a server instance identified by a domain name. For example: <code>peter.social</code>.
        A node may serve one user or many users depending on the implementation.
      </p>

      <h3>3.2 Identity</h3>
      <p>
        A user's identity is a URL: <code>https://&#123;node-domain&#125;/users/&#123;username&#125;</code>.
        This URL resolves to a public profile document that includes the user's display name, avatar, bio,
        and public key. This is the canonical identifier for a user across the entire network.
      </p>

      <h3>3.3 Resources</h3>
      <p>
        A resource is any piece of data owned by a user. Resources have a type (post, file, contact, or
        custom), an owner, an ID, timestamps, and an Access Control List (ACL) defining who can read them.
      </p>

      <h3>3.4 Trust</h3>
      <p>
        Trust is a permissioned relationship between two users. Trust is always initiated out-of-band (a
        link is shared privately) and is always read-only — a trusted party can read resources you grant
        them access to, and optionally send notifications to your inbox. They cannot modify your data.
      </p>

      <h3>3.5 Federation</h3>
      <p>
        When your node fetches data from another node on your behalf, it presents a signed
        server-to-server request. The remote node verifies the signature against your node's public key,
        checks your trust level, and either returns or denies the resource.
      </p>

      {/* 4. Identity & Discovery */}
      <h2>4. Identity &amp; Discovery</h2>

      <h3>4.1 Node Metadata</h3>
      <p>Every node exposes a well-known metadata endpoint:</p>
      <pre><code>{`GET /.well-known/node

Response:
{
  "name": "peter.social",
  "version": "1.0",
  "public_key": "<base64-encoded public key>",
  "features": ["trust", "federation", "inbox"]
}`}</code></pre>
      <p>
        This is the first call a node makes when it encounters a new domain. The public key here is
        used to verify server-signed federation requests.
      </p>

      <h3>4.2 User Profile</h3>
      <p>Returns the public profile for a user. This endpoint is always public — it is the user's identity document.</p>
      <pre><code>{`GET /users/:username

Response:
{
  "id": "https://peter.social/users/peter",
  "username": "peter",
  "display_name": "Peter",
  "bio": "...",
  "avatar_url": "https://peter.social/users/peter/avatar",
  "public_key": "<base64-encoded public key>",
  "node": "https://peter.social",
  "created_at": "2025-01-01T00:00:00Z"
}`}</code></pre>
      <div className="info-box">
        The <code>public_key</code> here is the user's personal key, distinct from the node's server key.
        It is used by clients to verify that requests are genuinely signed by this user.
      </div>

      {/* 5. Authentication */}
      <h2>5. Authentication</h2>

      <h3>5.1 User Auth (Client to Own Node)</h3>
      <p>
        Standard OAuth 2.0. A user authenticates to their own node using their preferred method
        (password, passkey, etc.). The node issues a short-lived JWT access token for subsequent
        requests. Implementation details are left to the node operator.
      </p>

      <h3>5.2 Key Management</h3>
      <p>
        The user holds their own private key. The node never stores it. When a client needs to sign a
        request, it signs locally before sending to the node. The protocol does not prescribe where keys
        are stored — this is up to the user. Reference implementations may include:
      </p>
      <ul>
        <li>Browser-local key storage</li>
        <li>AWS Secrets Manager integration</li>
        <li>Hardware security key (FIDO2/WebAuthn)</li>
        <li>Self-managed key file</li>
      </ul>
      <p>
        The only requirement is that the public key is registered on the user's profile document on the node.
      </p>

      <h3>5.3 Server-to-Server Auth (Federation)</h3>
      <p>
        When node A fetches a resource from node B on behalf of a user, it signs the HTTP request
        using node A's private key via HTTP Signatures (RFC 9421 or equivalent). Node B verifies the
        signature against node A's public key retrieved from <code>/.well-known/node</code>.
      </p>
      <p>The signed request includes:</p>
      <ul>
        <li>The requesting node's domain</li>
        <li>The identity URL of the user on whose behalf the request is made</li>
        <li>The target resource URL</li>
        <li>A timestamp (to prevent replay attacks)</li>
      </ul>

      {/* 6. Trust */}
      <h2>6. Trust</h2>

      <h3>6.1 Trust Levels</h3>
      <p>There are two trust levels:</p>
      <table className="spec-table">
        <tbody>
          <tr><td><code>read</code></td><td>Can read resources you have scoped to this trust level</td></tr>
          <tr><td><code>notify</code></td><td>Can send messages to your inbox (comments, reactions, DMs)</td></tr>
        </tbody>
      </table>
      <p>
        A trusted party with only read access cannot send anything to your inbox. Notify can be granted
        independently or alongside read.
      </p>

      <h3>6.2 Creating a Trust Invite</h3>
      <pre><code>{`POST /users/:username/trust/invite

Request body:
{
  "level": "read",
  "notify": true,
  "scope": ["posts", "photos"],
  "expires_in": "48h",
  "note": "For Alice"
}

Response:
{
  "invite_url": "https://peter.social/trust/accept?code=abc123",
  "expires_at": "2025-01-03T00:00:00Z"
}`}</code></pre>
      <p>
        The invite URL is shared out-of-band (via text, email, etc.). It is a one-time-use code. Once
        redeemed it is immediately invalidated.
      </p>

      <h3>6.3 Redeeming a Trust Invite</h3>
      <p>When Alice opens the invite URL, her node makes a server-to-server call:</p>
      <pre><code>{`POST /trust/redeem

{
  "code": "abc123",
  "requester_identity": "https://alice.social/users/alice"
}`}</code></pre>
      <p>
        If the code is valid and not expired, the inviting node issues a signed trust token and records the
        trust relationship.
      </p>

      <h3>6.4 Managing Trust</h3>
      <table className="spec-table">
        <tbody>
          <tr><td><code>GET /users/:username/trust</code></td><td>List all active trust relationships</td></tr>
          <tr><td><code>DELETE /users/:username/trust/:id</code></td><td>Revoke a trust relationship</td></tr>
          <tr><td><code>PATCH /users/:username/trust/:id</code></td><td>Update scope or level of an existing trust</td></tr>
        </tbody>
      </table>
      <p>
        When trust is revoked, the issued token is invalidated. Because tokens are short-lived
        (recommended TTL: 1 hour), a revoked party will lose access within one TTL window at most.
        Nodes may optionally implement a revocation list for immediate enforcement.
      </p>

      {/* 7. Resources */}
      <h2>7. Resources</h2>

      <h3>7.1 Standard Resource Types</h3>
      <table className="spec-table">
        <tbody>
          <tr><td><code>profile</code></td><td>Name, avatar, bio, date of birth, public key. Always readable by anyone with identity URL.</td></tr>
          <tr><td><code>post</code></td><td>Text content, timestamp, optional attachments.</td></tr>
          <tr><td><code>file</code></td><td>Binary data, MIME type, filename, size.</td></tr>
          <tr><td><code>contact</code></td><td>A reference to another user's identity URL, with optional label.</td></tr>
          <tr><td><code>custom</code></td><td>User-defined schema (see Section 7.4).</td></tr>
        </tbody>
      </table>

      <h3>7.2 Resource Endpoints</h3>
      <table className="spec-table">
        <tbody>
          <tr><td><code>GET /users/:username/resources</code></td><td>List all resource types the requester has access to</td></tr>
          <tr><td><code>GET /users/:username/resources/:type</code></td><td>List resources of a given type</td></tr>
          <tr><td><code>POST /users/:username/resources/:type</code></td><td>Create a new resource (owner only)</td></tr>
          <tr><td><code>GET /users/:username/resources/:type/:id</code></td><td>Fetch a specific resource</td></tr>
          <tr><td><code>PUT /users/:username/resources/:type/:id</code></td><td>Update a resource (owner only)</td></tr>
          <tr><td><code>DELETE /users/:username/resources/:type/:id</code></td><td>Delete a resource (owner only)</td></tr>
          <tr><td><code>GET /users/:username/resources/:type/:id/acl</code></td><td>Get ACL for a resource</td></tr>
          <tr><td><code>PUT /users/:username/resources/:type/:id/acl</code></td><td>Update ACL for a resource (owner only)</td></tr>
        </tbody>
      </table>

      <h3>7.3 Access Control Lists (ACL)</h3>
      <p>Every resource has an ACL that maps trust levels to access:</p>
      <pre><code>{`{
  "read": ["trusted", "friends"],
  "public": false
}`}</code></pre>
      <p>
        If <code>public</code> is true, any node can fetch the resource without a trust token.
        If false, only users with a matching trust level in the ACL can access it.
      </p>

      <h3>7.4 Custom Resource Types</h3>
      <p>Users can define their own resource schemas. A custom resource includes a schema name and field definitions:</p>
      <pre><code>{`{
  "type": "custom",
  "schema": "band-setlist",
  "fields": {
    "venue": "string",
    "date": "date",
    "songs": "array:string"
  },
  "data": {
    "venue": "The Crocodile",
    "date": "2025-03-15",
    "songs": ["Song A", "Song B", "Song C"]
  }
}`}</code></pre>
      <p>
        Nodes that do not recognize a custom schema can still store, forward, and display raw data.
        Applications that understand the schema can render it appropriately. Field types supported:
        <code>string</code>, <code>number</code>, <code>boolean</code>, <code>date</code>,
        <code>datetime</code>, <code>array:string</code>, <code>array:number</code>.
      </p>

      {/* 8. Inbox & Notifications */}
      <h2>8. Inbox &amp; Notifications</h2>

      <h3>8.1 Inbox</h3>
      <p>Each user has an inbox where trusted parties with notify permission can send messages.</p>
      <table className="spec-table">
        <tbody>
          <tr><td><code>GET /users/:username/inbox</code></td><td>Fetch inbox messages (owner only)</td></tr>
          <tr><td><code>POST /users/:username/inbox</code></td><td>Send a message (requires notify trust)</td></tr>
          <tr><td><code>DELETE /users/:username/inbox/:id</code></td><td>Delete a message (owner only)</td></tr>
        </tbody>
      </table>

      <h3>8.2 Push Notifications</h3>
      <p>
        When a resource changes that a trusted party has access to, the owner's node may push a
        notification to the subscriber's node inbox endpoint. This avoids polling. Push notifications are
        optional — a receiving node may ignore them and poll instead.
      </p>

      <h3>8.3 Spam Throttling</h3>
      <p>Each node can configure inbox throttle rules to prevent abuse:</p>
      <pre><code>{`{
  "inbox_throttle": {
    "max_per_hour": 50,
    "max_per_day": 200,
    "auto_revoke_on_exceed": true,
    "auto_revoke_notify_owner": true
  }
}`}</code></pre>
      <p>
        When a trusted party exceeds the threshold, their trust token is flagged or auto-revoked
        depending on configuration. The node owner is notified.
      </p>

      {/* 9. Federation */}
      <h2>9. Federation</h2>

      <h3>9.1 Federated Fetch</h3>
      <p>
        Federation uses a server-proxy model. The client never calls a remote node directly — it always
        calls its own node, which proxies the request on the user's behalf.
      </p>
      <p>There are two distinct key pairs involved in a federated fetch:</p>
      <ul>
        <li><strong>The user's key pair</strong> — the user signs the inbound request to their own node with their
        private key. The node verifies this against the user's public key stored in their profile.</li>
        <li><strong>The server's key pair</strong> — the node signs the outbound request to the remote node with the
        server's private key. The remote node verifies this against the requesting node's public key from <code>/.well-known/node</code>.</li>
      </ul>
      <p>The flow for fetching a remote resource:</p>
      <pre><code>{`POST /federation/fetch

{
  "resource": "https://alice.social/users/alice/resources/posts/123",
  "on_behalf_of": "peter"
}`}</code></pre>
      <p><strong>Step 1:</strong> The client signs this request with the user's private key and sends it to their node.</p>
      <p><strong>Step 2:</strong> The node verifies the signature against the user's public key. If invalid, the request is rejected.</p>
      <p><strong>Step 3:</strong> The node checks that the user has a valid trust token for the requested resource on the remote node.</p>
      <p><strong>Step 4:</strong> The node signs an outbound HTTP request with the server's private key and calls the remote node, presenting the user's trust token.</p>
      <p><strong>Step 5:</strong> The remote node verifies the server signature, checks the trust token, and returns or denies the resource.</p>
      <p><strong>Step 6:</strong> The node returns the (still encrypted) resource to the client. The client decrypts it locally using the user's private key.</p>
      <div className="info-box">
        The server never sees plaintext. It proxies ciphertext from the remote node back to the client, where
        decryption happens locally.
      </div>

      <h3>9.2 Application-Layer Collaboration</h3>
      <p>
        Multiple-node collaboration (e.g. shared documents, collaborative playlists) is explicitly out of
        scope for the protocol. Applications may read from multiple nodes simultaneously using their
        respective trust tokens and present a unified view. Write operations always go to the owning
        node only.
      </p>

      {/* 10. Security Requirements */}
      <h2>10. Security Requirements</h2>
      <p>
        The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY in this section are to be
        interpreted as described in RFC 2119.
      </p>

      <h3>10.1 Encryption at Rest</h3>
      <p>
        All user resource data stored on a node MUST be encrypted at rest. A node operator MUST
        NOT have the ability to read plaintext user data through any server-side mechanism.
      </p>
      <p>
        Encryption MUST be performed client-side before data is transmitted to the node. The node
        MUST only ever receive, store, and return ciphertext for user resources.
      </p>
      <p>
        The encryption algorithm used MUST be AES-256-GCM or an equivalent authenticated
        encryption scheme. Unauthenticated encryption schemes MUST NOT be used.
      </p>

      <h3>10.2 Key Ownership</h3>
      <p>
        A node MUST NOT request, store, log, or transmit a user's private key under any
        circumstances. Any implementation that sends a private key to the server is non-compliant and
        will fail federation with compliant nodes.
      </p>
      <p>
        Private keys MUST be derived or managed entirely on the client side.
      </p>

      <h3>10.3 Transport Security</h3>
      <p>
        All communication between clients and nodes, and between nodes, MUST use TLS 1.2 or
        higher. Plain HTTP connections MUST be rejected. Nodes SHOULD enforce HSTS.
      </p>

      <h3>10.4 Key Derivation (Client Implementations)</h3>
      <p>
        Client implementations that derive encryption keys from user passwords SHOULD use a
        memory-hard key derivation function such as Argon2id or scrypt. PBKDF2 with a minimum of
        310,000 iterations MAY be used as a fallback.
      </p>
      <p>
        Client implementations MUST NOT derive keys using MD5, SHA-1, or any non-KDF hash function.
      </p>

      <h3>10.5 Token Security</h3>
      <p>
        Trust tokens issued by a node MUST be signed JWTs. The signing algorithm MUST be RS256
        or ES256. HMAC-based algorithms (HS256 etc.) MUST NOT be used for trust tokens.
      </p>
      <p>
        Trust tokens MUST have an expiry (<code>exp</code> claim). The RECOMMENDED maximum TTL is 1 hour.
        Nodes MUST reject expired tokens.
      </p>
      <p>
        Nodes MUST maintain the ability to revoke individual trust tokens before their natural expiry.
        Nodes SHOULD implement an active revocation list for immediate enforcement.
      </p>

      <h3>10.6 Request Signing</h3>
      <p>
        PersonalNode uses two distinct key pairs for signing, each with a separate purpose. These
        MUST NOT be conflated.
      </p>
      <p>
        <strong>Client-to-node requests:</strong> The client MUST sign the request using the user's private key.
        The node MUST verify this signature against the user's public key stored in their profile.
        The node MUST reject any request whose user signature is invalid or missing.
      </p>
      <p>
        <strong>Node-to-node federation requests:</strong> The requesting node MUST sign the HTTP request using
        the server's private key. The receiving node MUST verify this signature against the requesting
        node's public key from <code>/.well-known/node</code>.
      </p>
      <p>
        Signed federation requests MUST include: the requesting node domain, the identity URL of the
        user, the target resource URL, and a timestamp. Requests older than 5 minutes MUST be
        rejected to prevent replay attacks.
      </p>
      <p>
        The signature scheme MUST follow RFC 9421 (HTTP Message Signatures) or a compatible
        equivalent. The signing algorithm MUST be RS256 or ES256.
      </p>

      <h3>10.7 Structural Enforcement</h3>
      <p>
        The security model is designed to be structurally self-enforcing. A node implementation that
        attempts to store or access user private keys cannot produce valid cryptographic signatures on
        behalf of users, and therefore cannot participate in federation with compliant nodes.
      </p>

      {/* 11. Compliance */}
      <h2>11. Compliance</h2>

      <h3>11.1 Compliance Tiers</h3>
      <table className="spec-table">
        <tbody>
          <tr><td><code>Node Compliant</code></td><td>The server implementation correctly implements the federation protocol, ACL enforcement, inbox throttling, token issuance and revocation, and all security requirements in Section 10.</td></tr>
          <tr><td><code>Host Certified</code></td><td>A Node Compliant implementation operated by a hosting provider, additionally verified against the PersonalNode Compliance Test Suite and listed in the official host directory.</td></tr>
        </tbody>
      </table>
      <p>
        Self-hosted nodes are not required to be Host Certified. Certification is relevant only to
        third-party hosting providers.
      </p>

      <h3>11.2 Compliance Test Suite</h3>
      <p>
        The PersonalNode Compliance Test Suite (CTS) is a separate open-source project that
        provides automated tests covering:
      </p>
      <ul>
        <li>Node metadata endpoint correctness</li>
        <li>User identity document format and public key registration</li>
        <li>Trust invite generation, redemption, and one-time enforcement</li>
        <li>Trust token signing algorithm and TTL enforcement</li>
        <li>Token revocation behavior</li>
        <li>ACL enforcement</li>
        <li>Federation request signature verification</li>
        <li>Replay attack prevention (timestamp enforcement)</li>
        <li>Inbox throttle behavior</li>
        <li>TLS enforcement</li>
        <li>Encryption at rest verification</li>
      </ul>
      <p>
        A node passes compliance when it passes all MUST-level tests in the CTS. SHOULD-level tests
        are reported separately and do not affect pass/fail status.
      </p>

      <h3>11.3 What Compliance Does Not Cover</h3>
      <p>
        Compliance testing covers server behavior only. Client implementations are not subject to
        compliance testing by this protocol. Compliance does not cover uptime, performance, data backup,
        or any operational characteristics of a hosting provider.
      </p>

      {/* 12. Open Questions */}
      <h2>12. Open Questions &amp; Future Work</h2>
      <ul>
        <li><strong>Key rotation</strong> — how does a user rotate their public key without losing existing trust relationships?</li>
        <li><strong>Node migration</strong> — how does a user move their data from one node to another while preserving identity?</li>
        <li><strong>Trust delegation</strong> — can a user grant a third-party application a scoped trust token?</li>
        <li><strong>Schema registry</strong> — should there be a community registry of named custom schemas?</li>
        <li><strong>Abuse reporting</strong> — inter-node mechanism for reporting bad actor nodes to peers.</li>
        <li><strong>End-to-end encryption</strong> — inbox messages and private resources could be E2E encrypted so even the node operator cannot read them.</li>
      </ul>

      {/* Appendix A */}
      <h2>Appendix A: HTTP Status Codes</h2>
      <table className="spec-table">
        <tbody>
          <tr><td><code>200 OK</code></td><td>Request succeeded</td></tr>
          <tr><td><code>201 Created</code></td><td>Resource created</td></tr>
          <tr><td><code>400 Bad Request</code></td><td>Malformed request body</td></tr>
          <tr><td><code>401 Unauthorized</code></td><td>Missing or invalid auth token</td></tr>
          <tr><td><code>403 Forbidden</code></td><td>Valid token but insufficient trust level</td></tr>
          <tr><td><code>404 Not Found</code></td><td>Resource does not exist or is hidden</td></tr>
          <tr><td><code>429 Too Many Requests</code></td><td>Inbox throttle exceeded</td></tr>
        </tbody>
      </table>

      {/* Appendix B */}
      <h2>Appendix B: Glossary</h2>
      <table className="spec-table">
        <tbody>
          <tr><td><code>Node</code></td><td>A PersonalNode server instance, identified by domain</td></tr>
          <tr><td><code>Identity URL</code></td><td>The canonical URL identifying a user: https://&#123;node&#125;/users/&#123;username&#125;</td></tr>
          <tr><td><code>Trust Token</code></td><td>A signed JWT issued when a trust invite is redeemed</td></tr>
          <tr><td><code>ACL</code></td><td>Access Control List — defines who can read a resource</td></tr>
          <tr><td><code>Federation</code></td><td>Server-to-server communication on behalf of a user</td></tr>
          <tr><td><code>Inbox</code></td><td>A user's inbound message queue for notifications and DMs</td></tr>
          <tr><td><code>HTTP Signature</code></td><td>A method of signing HTTP requests using asymmetric keys</td></tr>
        </tbody>
      </table>
    </div>
  )
}

export default SpecPage
