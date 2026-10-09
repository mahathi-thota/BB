import React,{useState}from'react';
import{Navigate,useNavigate}from'react-router-dom';
import{useAuth}from'../context/Auth';

function getAge(value){if(!value)return null;const dob=new Date(`${value}T00:00:00`),today=new Date();let age=today.getFullYear()-dob.getFullYear();if(today.getMonth()<dob.getMonth()||(today.getMonth()===dob.getMonth()&&today.getDate()<dob.getDate()))age--;return age>=0?age:null}

export default function AuthPage(){
  const{user,login}=useAuth(),navigate=useNavigate();
  const[register,setRegister]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const[form,setForm]=useState({fullName:'',collegeId:'',password:'',dateOfBirth:'',gender:'',college:'',branch:'',residenceType:'',hostelBlock:'',roomNumber:''});
  const update=(key,value)=>setForm(current=>({...current,[key]:value}));
  if(user)return <Navigate to="/" replace/>;
  async function submit(event){
    event.preventDefault();setError('');setNotice('');setBusy(true);
    try{
      await login(form,register);
      if(register){setRegister(false);setNotice('Account created. Please log in with your College ID and password.');setForm(current=>({...current,password:''}));}
      else navigate('/');
    }catch(e){setError(e.response?.data?.message||'Could not connect. Is the server running?');}
    finally{setBusy(false);}
  }
  function toggle(value){setRegister(value);setError('');setNotice('');}
  return <div className="login authPage">
    <div className="logo">🤝</div><h1>Borrow what you need.<br/><em>Share what you have.</em></h1>
    <p className="muted">What you need might already be with someone nearby.</p><div className="illus">🧑🏻‍🎓　🧮　🧑🏽‍🎓</div>
    {register&&<div className="formIntro"><h2>Create your student account</h2><p className="muted">Add your college details to join the campus community.</p></div>}
    {notice&&<p className="successMessage" role="status">{notice}</p>}
    <form onSubmit={submit}>
      {register&&<>
        <label>Full name<input required minLength="2" maxLength="40" autoComplete="name" value={form.fullName} onChange={e=>update('fullName',e.target.value)} placeholder="Priya Sharma"/></label>
        <label>Date of birth<input required type="date" autoComplete="bday" value={form.dateOfBirth} max={new Date().toISOString().slice(0,10)} onChange={e=>update('dateOfBirth',e.target.value)}/>{form.dateOfBirth&&<small className="fieldHint">Age: {getAge(form.dateOfBirth)}</small>}</label>
        <label>Gender<select required value={form.gender} onChange={e=>update('gender',e.target.value)}><option value="">Choose an option</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></label>
        <label>College / university<input required minLength="2" maxLength="100" value={form.college} onChange={e=>update('college',e.target.value)} placeholder="Your college name"/></label>
        <label>Branch / department<input required minLength="2" maxLength="80" value={form.branch} onChange={e=>update('branch',e.target.value)} placeholder="e.g. Computer Science"/></label>
        <label>Residence type<select required value={form.residenceType} onChange={e=>{update('residenceType',e.target.value);if(e.target.value!=='hosteller'){update('hostelBlock','');update('roomNumber','')}}}><option value="">Choose one</option><option value="hosteller">Hosteller</option><option value="day_scholar">Day scholar</option></select></label>
        {form.residenceType==='hosteller'&&<div className="hostelFields"><p className="muted">Hostel details help classmates coordinate item handoff. These are saved to your account.</p><label>Hostel block<input required maxLength="50" value={form.hostelBlock} onChange={e=>update('hostelBlock',e.target.value)} placeholder="e.g. Block B"/></label><label>Room number<input required maxLength="20" value={form.roomNumber} onChange={e=>update('roomNumber',e.target.value)} placeholder="e.g. 204"/></label></div>}
      </>}
      <label>College ID<input required inputMode="numeric" autoComplete="username" value={form.collegeId} onChange={e=>update('collegeId',e.target.value)} placeholder="12 or 14 digit roll number"/></label>
      <label>Password<input required type="password" minLength="8" autoComplete={register?'new-password':'current-password'} value={form.password} onChange={e=>update('password',e.target.value)} placeholder="At least 8 characters"/></label>
      {error&&<p className="error" aria-live="polite">{error}</p>}
      <button className="primary wide" disabled={busy}>{busy?'Please wait…':register?'Create account':'Login with College ID'}</button>
    </form>
    <p className="authToggle">{register?'Already have an account?':'New to BorrowBuddy?'} <button type="button" onClick={()=>toggle(!register)}>{register?'Log in':'Create an account'}</button></p>
    <p className="secure">🔒 Verified college students only</p>
  </div>;
}
