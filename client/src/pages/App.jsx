import React, { useEffect, useState } from 'react';
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { api, data } from '../api';
import { useAuth } from '../context/Auth';
import AuthPage from './AuthPage';

const cats = [
  '📚 Books',
  '🧮 Calculators',
  '🥼 Lab Coats',
  '🔌 Chargers',
  '♨️ Appliances',
  '🛠️ Project Tools',
  '🏏 Sports',
  '☔ Others',
];

const catName = (category) => category.split(' ').slice(1).join(' ');
const ru = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

function Guard({ children }) {
  const { user, ready } = useAuth();

  if (!ready) return <div className="loading">Loading BorrowBuddy…</div>;
  return user ? children : <Navigate to="/login" />;
}

function Frame({ children }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return undefined;

    const poll = () =>
      api
        .get('/notifications')
        .then((response) =>
          setUnread(response.data.data.filter((notification) => !notification.read).length),
        )
        .catch(() => {});

    poll();
    const timer = setInterval(poll, 10000);
    return () => clearInterval(timer);
  }, [user]);

  return (
    <div className="phone">
      <header>
        <Link to="/" className="brand">
          Borrow<span>Buddy</span>
        </Link>
        <Link className="bell" to="/notifications" aria-label="Notifications">
          ♢{unread > 0 && <i>{unread}</i>}
        </Link>
      </header>
      <main>{children}</main>
      <nav>
        <Link to="/">
          ⌂<small>Home</small>
        </Link>
        <Link to="/borrowings">
          ▣<small>Borrowings</small>
        </Link>
        <Link to="/lend">
          ＋<small>Lend</small>
        </Link>
        <Link to="/profile">
          ◉<small>Profile</small>
        </Link>
      </nav>
    </div>
  );
}

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ fullName: '', collegeId: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form, register);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect. Is the server running?');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <div className="logo">🤝</div>
      <h1>
        Borrow what you need.
        <br />
        <em>Share what you have.</em>
      </h1>
      <p className="muted">What you need might already be with someone nearby.</p>
      <div className="illus">🧑🏻‍🎓　🧮　🧑🏽‍🎓</div>
      <div className="switch">
        <button className={!register ? 'selected' : ''} onClick={() => setRegister(false)}>Login</button>
        <button className={register ? 'selected' : ''} onClick={() => setRegister(true)}>Register</button>
      </div>
      <form onSubmit={submit}>
        {register && (
          <label>
            Full name
            <input
              required
              minLength="2"
              maxLength="40"
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              placeholder="Priya Sharma"
            />
          </label>
        )}
        <label>
          College ID
          <input
            required
            inputMode="numeric"
            value={form.collegeId}
            onChange={(event) => setForm({ ...form, collegeId: event.target.value })}
            placeholder="12 or 14 digit roll number"
          />
        </label>
        <label>
          Password
          <input
            required
            type="password"
            minLength="8"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="At least 8 characters"
          />
        </label>
        {error && <p className="error" aria-live="polite">{error}</p>}
        <button className="primary wide" disabled={busy}>
          {busy ? 'Please wait…' : register ? 'Create your account' : 'Login with College ID'}
        </button>
      </form>
      <p className="secure">🔒 Verified college students only</p>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/items').then((response) => setItems(response.data.data)).catch(() => {});
  }, []);

  return (
    <>
      <div className="hero">
        <p className="eyebrow">CAMPUS SHARING, MADE EASY</p>
        <h1>Hi {user?.fullName?.split(' ')[0]} 👋</h1>
        <p>Find it nearby. Borrow it happily.</p>
      </div>
      <form
        className="search"
        onSubmit={(event) => {
          event.preventDefault();
          location.href = `/search?q=${encodeURIComponent(query)}`;
        }}
      >
        <span>⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What do you need?" />
        <button>→</button>
      </form>
      <div className="categoryGrid">
        {cats.map((category) => (
          <Link key={category} to={`/search?category=${encodeURIComponent(catName(category))}`}>
            {category}
          </Link>
        ))}
      </div>
      <div className="sectionTitle">
        <h2>Available near you</h2>
        <Link to="/search">See all →</Link>
      </div>
      <ItemGrid items={items.slice(0, 5)} />
      <div className="safety">
        🛡️ <span><b>Borrow with confidence</b><br />Verified campus members · Deposits are returned in full</span>
      </div>
    </>
  );
}

function ItemPhoto({ item, className = 'itemPhoto' }) {
  const [failed, setFailed] = useState(false);
  const photoUrl = item?.photoUrl;

  if (!photoUrl || failed) {
    return <div className={className === 'detailPhoto' ? 'detailEmoji' : 'itemEmoji'}>{item?.emoji || '📦'}</div>;
  }

  // The backend serves uploaded images from http://localhost:5000/uploads/...
  const src = /^https?:\/\//i.test(photoUrl)
    ? photoUrl
    : `http://localhost:5000${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;

  return (
    <img
      className={className}
      src={src}
      alt={item?.name || 'BorrowBuddy item'}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function ItemGrid({ items }) {
  return (
    <div className="cards">
      {items.map((item) => (
        <Link to={`/item/${item._id}`} className="itemCard" key={item._id}>
          <ItemPhoto item={item} />
          <div className="itemInfo">
            <b>{item.name}</b>
            <small>{item.condition} · {item.distanceKm || '0.5'} km away</small>
            <small>
              {item.owner?.fullName || 'Campus student'} · ⭐ {item.owner?.trustScore || 4}
              {item.owner?.trustScore < 3.5 && <strong className="low">⚠️ Low trust</strong>}
            </small>
            <div className="price">{ru(item.deposit)} refundable deposit</div>
            <span className="outline">View Details</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Search() {
  const params = new URLSearchParams(location.search);
  const [query, setQuery] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setBusy(true);
    api.get('/items', { params: { q: query, category: category || undefined } })
      .then((response) => setItems(response.data.data))
      .catch(() => setItems([]))
      .finally(() => setBusy(false));
  }, [query, category]);

  return (
    <>
      <h1>Find something</h1>
      <input className="searchInput" placeholder="Search items…" value={query} onChange={(event) => setQuery(event.target.value)} />
      <div className="chips">
        <button className={!category ? 'active' : ''} onClick={() => setCategory('')}>All</button>
        {cats.map((cat) => (
          <button className={category === catName(cat) ? 'active' : ''} onClick={() => setCategory(catName(cat))} key={cat}>
            {cat}
          </button>
        ))}
      </div>
      <p className="muted">{busy ? 'Looking around…' : `${items.length} items near you`}</p>
      {busy ? <div className="loading">Finding the good stuff…</div> : items.length ? <ItemGrid items={items} /> : <div className="empty">🔎<h2>Nothing found yet</h2><p>Try another search or category.</p></div>}
    </>
  );
}

function Item() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/items/${id}`)
      .then((response) => setItem(response.data.data))
      .catch(() => setError('This listing is unavailable'));
  }, [id]);

  if (error) return <div className="empty">{error}<Link to="/">Go home</Link></div>;
  if (!item) return <div className="loading">Loading listing…</div>;

  return (
    <>
      <Link to="/search" className="back">← Back to search</Link>
      <ItemPhoto item={item} className="detailPhoto" />
      <span className="pill">{item.condition}</span>
      <h1>{item.name}</h1>
      <p>Available through {item.availableUntil ? new Date(item.availableUntil).toLocaleDateString() : 'this week'}</p>
      <div className="ownerBox">
        <div className="avatar">{item.owner?.fullName?.[0] || '?'}</div>
        <div>
          <b>{item.owner?.fullName || 'Campus student'}</b>
          <small>⭐ {item.owner?.trustScore} · Verified College Student ✓</small>
        </div>
      </div>
      {item.owner?.trustScore < 3.5 && <div className="warning">⚠️ Low trust lender ({item.owner.trustScore}). Meet in a busy place and check the item together.</div>}
      <div className="panel">
        <h3>Refundable security deposit</h3>
        <p>Deposit held for the loan <b>{ru(item.deposit)}</b></p>
        <p className="refund">Returned in full after owner confirms return <b>{ru(item.deposit)}</b></p>
        <small>Borrowing is free. The deposit is only for item safety.</small>
      </div>
      <h3>About this item</h3>
      <p>{item.description}</p>
      <Link className="primary wide cta" to={`/request/${id}`}>Request to Borrow</Link>
      <ReportBox item={item} />
    </>
  );
}

function ReportBox({ item }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  async function send(event) {
    event.preventDefault();
    const targetType = event.target.targetType.value;
    try {
      await api.post('/reports', {
        targetType,
        targetId: targetType === 'item' ? item._id : item.owner._id,
        reason: event.target.reason.value,
        note: event.target.note.value,
      });
      setMessage('Report submitted. Thank you.');
      setOpen(false);
    } catch {
      setMessage('Could not submit report.');
    }
  }

  return (
    <div className="report">
      <button className="textButton" onClick={() => setOpen(!open)}>Report user or item</button>
      {message && <small>{message}</small>}
      {open && (
        <form onSubmit={send}>
          <select name="targetType"><option value="item">This item</option><option value="user">The owner</option></select>
          <select name="reason"><option>Item not as described</option><option>Didn't show up</option><option>Unsafe or rude behaviour</option><option>Fake listing</option></select>
          <textarea name="note" placeholder="Optional note" />
          <button className="primary">Submit report</button>
        </form>
      )}
    </div>
  );
}

function Request() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [block, setBlock] = useState('Uni Block');
  const [floor, setFloor] = useState(1);
  const [pickup, setPickup] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/items/${id}`).then((response) => setItem(response.data.data)).catch(() => {});
  }, [id]);

  if (!item) return <div className="loading">Loading request…</div>;

  async function send(event) {
    event.preventDefault();
    try {
      const response = await api.post('/borrowings', {
        itemId: id,
        pickupAt: pickup,
        returnAt: returnDate,
        meetingLocation: { block, floor },
      });
      navigate(`/request-sent/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send request');
    }
  }

  return (
    <>
      <Link to={`/item/${id}`} className="back">← {item.name}</Link>
      <h1>Request to borrow</h1>
      <div className="requestSummary">
        <span>{item.emoji || '📦'}</span>
        <div><b>{item.name}</b><small>Free to borrow · Refundable deposit {ru(item.deposit)}</small></div>
      </div>
      <form onSubmit={send} className="formStack">
        <label>Pickup date<input required type="date" value={pickup} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setPickup(event.target.value)} /></label>
        <label>Return date<input required type="date" value={returnDate} min={pickup || new Date().toISOString().slice(0, 10)} onChange={(event) => setReturnDate(event.target.value)} /></label>
        <h3>Meet at</h3>
        <div className="chips">{['Uni Block', 'Autonomous Block'].map((value) => <button type="button" onClick={() => setBlock(value)} className={block === value ? 'active' : ''} key={value}>{value}</button>)}</div>
        <div className="chips">{[1, 2, 3, 4].map((value) => <button type="button" className={floor === value ? 'active' : ''} onClick={() => setFloor(value)} key={value}>{['1st', '2nd', '3rd', '4th'][value - 1]} floor</button>)}</div>
        <p className="muted">📍 {block} – {['1st', '2nd', '3rd', '4th'][floor - 1]} Floor</p>
        <p className="muted">Your full security deposit will be returned after the item is checked in.</p>
        {error && <p className="error">{error}</p>}
        <button className="primary wide">Send Request</button>
      </form>
    </>
  );
}

function Sent() {
  const { id } = useParams();
  return (
    <div className="empty success">
      🎉
      <h1>Request sent!</h1>
      <p>The owner will be notified. You'll hear when they accept.</p>
      <p>Your security deposit is refundable in full when the item is returned.</p>
      <Link className="primary" to="/borrowings">Track my request</Link>
    </div>
  );
}

function Borrowings() {
  const [role, setRole] = useState('borrower');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setRows(await data(api.get('/borrowings/mine', { params: { role } })));
    } catch {
      setError('Could not load borrowings');
    }
  }

  useEffect(() => { load(); }, [role]);

  async function act(id, action) {
    try {
      await api.patch(`/borrowings/${id}/${action}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  }

  return (
    <>
      <h1>My borrowings</h1>
      <div className="switch">
        <button className={role === 'borrower' ? 'selected' : ''} onClick={() => setRole('borrower')}>Borrowing</button>
        <button className={role === 'owner' ? 'selected' : ''} onClick={() => setRole('owner')}>Incoming requests</button>
      </div>
      {error && <p className="error">{error}</p>}
      {rows.length === 0 ? (
        <div className="empty">📦<h2>No borrowings yet</h2><Link to="/search">Find something to borrow</Link></div>
      ) : rows.map((borrowing) => (
        <article className="borrowCard" key={borrowing._id}>
          <div className="requestSummary">
            <span>{borrowing.item?.emoji || '📦'}</span>
            <div><b>{borrowing.item?.name}</b><small>{role === 'owner' ? `From ${borrowing.borrower.fullName}` : `Owner ${borrowing.owner.fullName}`}</small></div>
          </div>
          <span className="pill">{borrowing.status.replace('_', ' ')}</span>
          <small>📍 {borrowing.meetingLocation.block} – {['', '1st', '2nd', '3rd', '4th'][borrowing.meetingLocation.floor]} Floor · Return {new Date(borrowing.returnAt).toLocaleDateString()}</small>
          <div className="actions">
            {role === 'owner' && borrowing.status === 'PENDING' && <><button onClick={() => act(borrowing._id, 'accept')} className="primary">Accept</button><button onClick={() => act(borrowing._id, 'decline')} className="outline">Decline</button></>}
            {role === 'borrower' && borrowing.status === 'ACCEPTED' && <button onClick={() => act(borrowing._id, 'collect')} className="primary">I've collected it</button>}
            {role === 'borrower' && borrowing.status === 'ACTIVE' && <button onClick={() => act(borrowing._id, 'return')} className="primary">Return Item</button>}
            {role === 'owner' && borrowing.status === 'RETURN_REQUESTED' && <button onClick={() => act(borrowing._id, 'confirm-return')} className="primary">Confirm return</button>}
            {role === 'borrower' && borrowing.status === 'RETURNED' && <RatingForm id={borrowing._id} />}
          </div>
          {borrowing.status === 'ACTIVE' && new Date(borrowing.returnAt) - Date.now() < 864e5 && <div className="warning">⏰ Return reminder: this item is due within 24 hours.</div>}
        </article>
      ))}
    </>
  );
}

function RatingForm({ id }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      {!open ? <button className="primary" onClick={() => setOpen(true)}>Rate owner</button> : (
        <form onSubmit={async (event) => {
          event.preventDefault();
          try {
            await api.post(`/borrowings/${id}/rate`, {
              stars: Number(event.target.stars.value),
              comment: event.target.comment.value,
              tags: [],
            });
            setMessage('Thanks for rating!');
          } catch (err) {
            setMessage(err.response?.data?.message || 'Rating failed');
          }
        }}>
          <label>Stars<select name="stars">{[5, 4, 3, 2, 1].map((star) => <option key={star}>{star}</option>)}</select></label>
          <textarea name="comment" placeholder="Leave a kind note (optional)" />
          <button className="primary">Submit rating</button>
        </form>
      )}
      {message && <small>{message}</small>}
    </>
  );
}

function Lend() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');

  async function load() {
    try {
      setItems(await data(api.get('/items/mine')));
    } catch {}
  }

  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
      await api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Your item is listed!');
      event.target.reset();
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not list item');
    }
  }

  return (
    <>
      <h1>Lend something</h1>
      <p className="muted">Borrowing is free. The security deposit is returned in full after the item comes back.</p>
      <form className="formStack panel" onSubmit={submit}>
        <label>Item name<input name="name" required minLength="2" placeholder="e.g. Scientific calculator" /></label>
        <label>Category<select name="category">{cats.map((category) => <option key={category}>{catName(category)}</option>)}</select></label>
        <label>Condition<select name="condition"><option>Excellent</option><option>Good</option><option>Fair</option></select></label>
        <label>Security deposit (₹)<input name="deposit" type="number" min="1" required /></label>
        <label>Available from<input name="availableFrom" type="date" /></label>
        <label>Available until<input name="availableUntil" type="date" /></label>
        <label>Description<textarea name="description" /></label>
        <label>Photo<input name="photo" type="file" accept="image/*" /></label>
        <button className="primary wide">List Item</button>
        {message && <small>{message}</small>}
      </form>
      <h2>Your items</h2>
      {items.map((item) => (
        <div className="requestSummary" key={item._id}>
          <ItemPhoto item={item} />
          <b>{item.name}</b>
          <button className="textButton" onClick={async () => { await api.delete(`/items/${item._id}`); load(); }}>Pause</button>
        </div>
      ))}
    </>
  );
}

function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.get('/users/me/stats').then((response) => setStats(response.data.data));
    api.get('/users/me/transactions').then((response) => setTransactions(response.data.data));
  }, []);

  return (
    <>
      <h1>My profile</h1>
      <div className="profileHead">
        <div className="avatar big">{user.fullName[0]}</div>
        <div><h2>{user.fullName}</h2><p>Roll no. {user.collegeId}</p><small>College ID verified ✓</small></div>
      </div>
      <div className="score">⭐ {stats?.trustScore || user.trustScore}<small>Trust score</small></div>
      <div className="metrics">{[['Items lent', stats?.itemsLent], ['Items borrowed', stats?.itemsBorrowed], ['Successful returns', stats?.successfulReturns]].map((entry) => <div key={entry[0]}><b>{entry[1] || 0}</b><small>{entry[0]}</small></div>)}</div>
      <h2>Wallet activity</h2>
      {transactions.length ? transactions.map((transaction) => (
        <div className="tx" key={transaction._id}><span>{transaction.type.replace('_', ' ')}</span><b>{ru(transaction.amount)}</b></div>
      )) : <p className="muted">No transactions yet. Deposit holds and refunds will show here.</p>}
      <button className="outline wide" onClick={logout}>Log out</button>
    </>
  );
}

function Notifications() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/notifications').then((response) => setRows(response.data.data)).catch(() => {});
  }, []);

  async function read(notification) {
    if (!notification.read) await api.patch(`/notifications/${notification._id}/read`);
  }

  return (
    <>
      <h1>Notifications</h1>
      {rows.length ? rows.map((notification) => (
        <Link
          onClick={() => read(notification)}
          className={`notification ${notification.read ? '' : 'unread'}`}
          to={notification.link || '/borrowings'}
          key={notification._id}
        >
          <b>{notification.title}</b>
          <p>{notification.body}</p>
          <small>{new Date(notification.createdAt).toLocaleString()}</small>
        </Link>
      )) : <div className="empty">🔔<h2>All caught up</h2><p>We'll let you know when something happens.</p></div>}
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="*" element={
        <Guard>
          <Frame>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/item/:id" element={<Item />} />
              <Route path="/request/:id" element={<Request />} />
              <Route path="/request-sent/:id" element={<Sent />} />
              <Route path="/borrowings" element={<Borrowings />} />
              <Route path="/lend" element={<Lend />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Frame>
        </Guard>
      } />
    </Routes>
  );
}
