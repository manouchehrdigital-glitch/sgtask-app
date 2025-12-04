import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  where,
  writeBatch,
  getDocs,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { 
  Plus, 
  MoreHorizontal, 
  X, 
  Layout,
  Search,
  Menu,
  User,
  AlertTriangle,
  RefreshCw,
  Edit2, 
  Check,
  ChevronRight,
  LogOut,
  Shield,
  Trash2,
  Tag,
  CheckSquare,
  AlignLeft
} from 'lucide-react';

// --- Firebase Configuration (بخش مهم: اطلاعات خود را اینجا وارد کنید) ---
const firebaseConfig = {
  apiKey: "AIzaSyAWiiI9Pry30RzK_c4gggd29vWmJx49L5Y",
  authDomain: "sgtask-b21fe.firebaseapp.com",
  projectId: "sgtask-b21fe",
  storageBucket: "sgtask-b21fe.firebasestorage.app",
  messagingSenderId: "913711953990",
  appId: "1:913711953990:web:59d56a8ec3f69e959e3247",
  measurementId: "G-560FFJGHFD"
};

// راه‌اندازی فایربیس
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// نام اپلیکیشن (ثابت)
const appId = "sgtask-production";
const ADMIN_EMAIL = 'manouchehr.digital@gmail.com';

// --- Styles ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;300;400;500;700;900&display=swap');

    /* تنظیم فونت‌ها - مطمئن شوید فایل‌ها در پوشه public/fonts هستند */
    @font-face {
      font-family: 'SG Kara';
      src: url('/fonts/990223 SGKara FaNum Regular.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'SG Kara';
      src: url('/fonts/990223 SGKara FaNum Bold.ttf') format('truetype');
      font-weight: bold;
      font-style: normal;
    }
    
    body {
      font-family: 'SG Kara', 'Vazirmatn', 'Tahoma', sans-serif;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.05);
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.2);
      border-radius: 4px;
    }
  `}</style>
);

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    transparent: "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }) => (
  <input 
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${className}`}
    {...props}
  />
);

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 p-6" dir="rtl">
        <button onClick={onClose} className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors z-10">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

// --- Auth Component ---
const AuthScreen = ({ error, clearError }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');
    clearError();

    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Check if user profile exists (not banned)
        const userDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'user_profiles', userCredential.user.uid));
        // If doc doesn't exist but auth worked, recreate it (optional) or deny
      } else {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(userCredential.user, { displayName: name });
        
        // Save public profile
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'user_profiles', userCredential.user.uid), {
            uid: userCredential.user.uid,
            displayName: name || email.split('@')[0],
            email: email,
            role: email === ADMIN_EMAIL ? 'admin' : 'user',
            createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error(err);
      let msg = "خطایی رخ داد: " + err.message;
      if (err.code === 'auth/invalid-credential') msg = "ایمیل یا رمز عبور اشتباه است.";
      if (err.code === 'auth/email-already-in-use') msg = "این ایمیل قبلاً ثبت شده است.";
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">ورود به SGTask</h1>
        </div>
        {(error || localError) && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {localError || error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div><label className="block text-sm mb-1">نام</label><Input value={name} onChange={(e)=>setName(e.target.value)} /></div>
          )}
          <div><label className="block text-sm mb-1">ایمیل</label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
          <div><label className="block text-sm mb-1">رمز عبور</label><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></div>
          <Button type="submit" className="w-full h-10" disabled={loading}>{loading ? '...' : (isLogin ? 'ورود' : 'ثبت نام')}</Button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-600 hover:underline">
            {isLogin ? 'ساخت حساب جدید' : 'ورود به حساب موجود'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Modals ---
const CreateBoardModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('bg-blue-600');
  const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-purple-600', 'bg-slate-600'];

  const handleSubmit = () => { onCreate(title, color); setTitle(''); };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">ساخت برد جدید</h2>
      <div className="space-y-4">
        <div><label className="block text-sm mb-1">عنوان</label><Input value={title} onChange={(e)=>setTitle(e.target.value)} autoFocus /></div>
        <div className="flex gap-2">{colors.map(c => <button key={c} onClick={()=>setColor(c)} className={`w-8 h-8 rounded-full ${c} ${color===c?'ring-2 ring-offset-2 ring-gray-400':''}`} />)}</div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="ghost" onClick={onClose}>انصراف</Button><Button onClick={handleSubmit}>ایجاد</Button></div>
      </div>
    </Modal>
  );
};

const CardDetailModal = ({ card, listName, allUsers, onClose, onUpdate, onDelete }) => {
  const [desc, setDesc] = useState(card.description || '');
  const [assignee, setAssignee] = useState(card.assignee || '');
  const [checkInput, setCheckInput] = useState('');

  const addCheck = () => {
    if(!checkInput.trim()) return;
    const item = { id: Date.now(), text: checkInput, done: false };
    onUpdate({ checklist: [...(card.checklist||[]), item] });
    setCheckInput('');
  };

  const toggleCheck = (id) => {
    const newCheck = (card.checklist||[]).map(i => i.id === id ? {...i, done: !i.done} : i);
    onUpdate({ checklist: newCheck });
  };

  const delCheck = (id) => {
    const newCheck = (card.checklist||[]).filter(i => i.id !== id);
    onUpdate({ checklist: newCheck });
  };

  const toggleLabel = (c) => {
    const labels = card.labels || [];
    const newLabels = labels.includes(c) ? labels.filter(l => l!==c) : [...labels, c];
    onUpdate({ labels: newLabels });
  };

  return (
    <Modal isOpen={!!card} onClose={onClose}>
      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-1"><Layout size={14}/> لیست: {listName}</div>
          <input className="text-2xl font-bold w-full border-none focus:ring-0 p-0" value={card.title} onChange={(e)=>onUpdate({title:e.target.value})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><AlignLeft size={18}/> توضیحات</h3>
              <textarea className="w-full p-3 border rounded-lg min-h-[100px]" value={desc} onChange={(e)=>setDesc(e.target.value)} onBlur={()=>onUpdate({description:desc})} placeholder="توضیحات..." />
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><CheckSquare size={18}/> چک‌لیست</h3>
              <div className="space-y-2 mb-2">
                {card.checklist?.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={item.done} onChange={()=>toggleCheck(item.id)} />
                    <span className={item.done ? 'line-through text-gray-400' : ''}>{item.text}</span>
                    <button onClick={()=>delCheck(item.id)} className="text-red-400 mr-auto"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2"><Input value={checkInput} onChange={(e)=>setCheckInput(e.target.value)} placeholder="آیتم جدید..." /><Button size="sm" onClick={addCheck}>افزودن</Button></div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-gray-500 mb-1">مسئول</div>
              <select className="w-full p-2 border rounded" value={assignee} onChange={(e)=>{setAssignee(e.target.value); onUpdate({assignee:e.target.value})}}>
                <option value="">انتخاب...</option>
                {allUsers.map(u => <option key={u.uid} value={u.displayName}>{u.displayName}</option>)}
              </select>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500 mb-1">برچسب</div>
              <div className="flex gap-1 flex-wrap">
                {['red','green','blue','yellow','purple'].map(c => (
                  <button key={c} onClick={()=>toggleLabel(c)} className={`w-6 h-6 rounded-full bg-${c}-500 ${card.labels?.includes(c)?'ring-2 ring-offset-1':''}`} />
                ))}
              </div>
            </div>
            <Button variant="danger" className="w-full" onClick={onDelete}>حذف کارت</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const AdminUsersModal = ({ isOpen, onClose, users, onDeleteUser }) => {
  if(!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">مدیریت کاربران</h2>
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.uid} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
            <div>
              <div className="font-bold">{u.displayName}</div>
              <div className="text-xs text-gray-500">{u.email}</div>
            </div>
            {u.role !== 'admin' && <button onClick={()=>onDeleteUser(u.uid)} className="text-red-500"><Trash2/></button>}
          </div>
        ))}
      </div>
    </Modal>
  );
};

// --- Main App ---
export default function SGTaskApp() {
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  
  // Inline edit states
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingCardToList, setAddingCardToList] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [tempListTitle, setTempListTitle] = useState('');

  // 1. Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Fetch Users (Public Profile)
  useEffect(() => {
    if(!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'user_profiles'));
    const unsub = onSnapshot(q, (snap) => {
      const users = snap.docs.map(d => d.data());
      setAllUsers(users);
    });
    return () => unsub();
  }, [user]);

  // 3. Fetch Boards
  useEffect(() => {
    if(!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'boards'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const b = snap.docs.map(d => ({id: d.id, ...d.data()}));
      setBoards(b);
      if(!activeBoard && b.length > 0) setActiveBoard(b[0]);
    });
    return () => unsub();
  }, [user]);

  // 4. Fetch Lists & Cards
  useEffect(() => {
    if(!user || !activeBoard) return;
    const qLists = query(collection(db, 'artifacts', appId, 'public', 'data', 'lists'), where('boardId', '==', activeBoard.id));
    const unsubLists = onSnapshot(qLists, (snap) => {
      const l = snap.docs.map(d => ({id: d.id, ...d.data()}));
      l.sort((a,b) => (a.createdAt?.seconds||0) - (b.createdAt?.seconds||0));
      setLists(l);
    });

    const qCards = query(collection(db, 'artifacts', appId, 'public', 'data', 'cards'), where('boardId', '==', activeBoard.id));
    const unsubCards = onSnapshot(qCards, (snap) => {
      const c = snap.docs.map(d => ({id: d.id, ...d.data()}));
      setCards(c);
    });

    return () => { unsubLists(); unsubCards(); };
  }, [user, activeBoard]);

  // Actions
  const createBoard = async (title, color) => {
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'boards'), {
      title, color, createdBy: user.uid, createdAt: serverTimestamp()
    });
    setIsCreateBoardModalOpen(false);
  };

  const deleteBoard = async (boardId) => {
    if(!confirm('حذف شود؟')) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'boards', boardId));
    if(activeBoard?.id === boardId) setActiveBoard(null);
  };

  const createList = async () => {
    if(!newListTitle.trim()) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'lists'), {
      title: newListTitle, boardId: activeBoard.id, createdAt: serverTimestamp()
    });
    setNewListTitle(''); setAddingList(false);
  };

  const updateList = async (id, title) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'lists', id), { title });
    setEditingListId(null);
  };

  const deleteList = async (id) => {
    if(!confirm('حذف لیست؟')) return;
    const batch = writeBatch(db);
    batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'lists', id));
    cards.filter(c => c.listId === id).forEach(c => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'cards', c.id)));
    await batch.commit();
  };

  const createCard = async (listId) => {
    if(!newCardTitle.trim()) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'cards'), {
      title: newCardTitle, listId, boardId: activeBoard.id, createdAt: serverTimestamp(), labels: [], checklist: []
    });
    setNewCardTitle('');
  };

  const updateCard = async (id, data) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'cards', id), data);
  };

  const deleteCard = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'cards', id));
    setSelectedCard(null);
  };

  const deleteUser = async (uid) => {
    if(!confirm('کاربر حذف شود؟')) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'user_profiles', uid));
  };

  const isAdmin = user && user.email === ADMIN_EMAIL;

  if (loading) return <div className="flex justify-center items-center h-screen">در حال بارگذاری...</div>;
  if (!user) return <><GlobalStyles /><AuthScreen error={authError} clearError={()=>setAuthError(null)} /></>;

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden" dir="rtl">
      <GlobalStyles />
      
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 flex flex-col overflow-hidden`}>
        <div className="p-4 flex items-center gap-2 border-b border-gray-700 font-bold text-lg">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">SG</div> SGTask
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="px-2 mb-2 text-xs font-bold text-gray-400">بردها</div>
          {boards.map(b => (
            <div key={b.id} onClick={()=>setActiveBoard(b)} className={`flex justify-between items-center p-2 rounded cursor-pointer mb-1 ${activeBoard?.id===b.id ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>
              <div className="flex items-center gap-2 overflow-hidden"><span className={`w-3 h-3 rounded-full ${b.color}`}></span><span className="truncate">{b.title}</span></div>
              {(b.createdBy === user.uid || isAdmin) && <button onClick={(e)=>{e.stopPropagation(); deleteBoard(b.id)}} className="text-gray-400 hover:text-red-400"><Trash2 size={14}/></button>}
            </div>
          ))}
          <button onClick={()=>setIsCreateBoardModalOpen(true)} className="flex items-center gap-2 p-2 w-full text-sm text-gray-400 hover:text-white mt-2"><Plus size={16}/> برد جدید</button>
          
          {isAdmin && (
            <div className="mt-4 border-t border-gray-700 pt-4">
              <button onClick={()=>setIsAdminModalOpen(true)} className="flex items-center gap-2 p-2 w-full text-sm text-blue-300 hover:bg-gray-800 rounded"><Shield size={16}/> مدیریت کاربران</button>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-between items-center text-sm">
          <div className="truncate w-32" title={user.email}>{user.displayName || user.email}</div>
          <button onClick={()=>signOut(auth)}><LogOut size={16}/></button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col h-full">
        <div className="h-14 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button onClick={()=>setIsSidebarOpen(!isSidebarOpen)}><Menu/></button>
            {activeBoard && <h1 className="font-bold">{activeBoard.title}</h1>}
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-2.5 text-gray-400" size={16}/>
            <input className="pr-9 pl-4 py-1.5 bg-gray-100 rounded-full text-sm w-64" placeholder="جستجو..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className={`flex-1 overflow-x-auto p-6 ${activeBoard?.color || 'bg-blue-600'}`}>
          {!activeBoard ? (
            <div className="flex flex-col items-center justify-center h-full text-white"><p className="text-xl">یک برد انتخاب کنید</p></div>
          ) : (
            <div className="flex items-start gap-4 h-full">
              {lists.map(list => (
                <div key={list.id} className="w-72 flex-shrink-0 bg-gray-100 rounded-xl shadow-lg flex flex-col max-h-full">
                  <div className="p-3 flex justify-between items-center font-bold text-gray-700 text-sm">
                    {editingListId === list.id ? (
                      <div className="flex gap-1 w-full"><Input autoFocus value={tempListTitle} onChange={(e)=>setTempListTitle(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&updateList(list.id, tempListTitle)} className="h-8 text-sm"/> <button onClick={()=>updateList(list.id, tempListTitle)} className="text-green-600"><Check size={16}/></button></div>
                    ) : (
                      <>
                        <span onClick={()=>{setEditingListId(list.id); setTempListTitle(list.title)}} className="cursor-pointer flex-1">{list.title}</span>
                        <div className="flex gap-1">
                          <button onClick={()=>deleteList(list.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto px-2 space-y-2 custom-scrollbar pb-2">
                    {cards.filter(c => c.listId === list.id && c.title.includes(searchQuery)).map(card => (
                      <div key={card.id} onClick={()=>setSelectedCard(card)} className="bg-white p-3 rounded shadow-sm cursor-pointer hover:shadow-md border border-gray-200">
                        {card.labels?.length > 0 && <div className="flex gap-1 mb-2">{card.labels.map(l=><div key={l} className={`h-1.5 w-8 rounded-full bg-${l}-500`}/>)}</div>}
                        <p className="text-sm font-medium">{card.title}</p>
                        <div className="flex justify-between mt-2">
                           <div className="flex gap-2 text-gray-400 text-xs">{card.description && <AlignLeft size={14}/>} {card.checklist?.length > 0 && <CheckSquare size={14}/>}</div>
                           {card.assignee && <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px]">{card.assignee[0]}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2">
                    {addingCardToList === list.id ? (
                      <div className="bg-white p-2 rounded border shadow-sm">
                        <textarea autoFocus className="w-full text-sm p-1 resize-none border-none focus:ring-0" placeholder="عنوان..." value={newCardTitle} onChange={(e)=>setNewCardTitle(e.target.value)} />
                        <div className="flex gap-2 mt-2"><Button size="sm" onClick={()=>createCard(list.id)}>افزودن</Button><button onClick={()=>setAddingCardToList(null)}><X size={18}/></button></div>
                      </div>
                    ) : (
                      <button onClick={()=>setAddingCardToList(list.id)} className="w-full flex items-center gap-2 text-gray-500 hover:bg-gray-200 p-2 rounded text-sm"><Plus size={16}/> افزودن کارت</button>
                    )}
                  </div>
                </div>
              ))}
              <div className="w-72 flex-shrink-0">
                {addingList ? (
                  <div className="bg-gray-100 p-2 rounded-xl">
                    <Input autoFocus placeholder="عنوان لیست..." value={newListTitle} onChange={(e)=>setNewListTitle(e.target.value)} />
                    <div className="flex gap-2 mt-2"><Button onClick={createList}>افزودن</Button><button onClick={()=>setAddingList(false)}><X/></button></div>
                  </div>
                ) : (
                  <button onClick={()=>setAddingList(true)} className="w-full bg-white/20 text-white p-3 rounded-xl flex items-center gap-2 hover:bg-white/30"><Plus/> لیست جدید</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateBoardModal isOpen={isCreateBoardModalOpen} onClose={()=>setIsCreateBoardModalOpen(false)} onCreate={createBoard} />
      {selectedCard && <CardDetailModal card={selectedCard} listName={lists.find(l=>l.id===selectedCard.listId)?.title} allUsers={allUsers} onClose={()=>setSelectedCard(null)} onUpdate={(d)=>updateCard(selectedCard.id, d)} onDelete={()=>deleteCard(selectedCard.id)} />}
      <AdminUsersModal isOpen={isAdminModalOpen} onClose={()=>setIsAdminModalOpen(false)} users={allUsers} onDeleteUser={deleteUser} />
    </div>
  );
}