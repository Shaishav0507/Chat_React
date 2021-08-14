import ChatOnline from "../../components/chatOnline/ChatOnline"
import chatOnline from "../../components/chatOnline/ChatOnline"
import Conversation from "../../components/conversations/Conversation"
import Message from "../../components/message/Message"
import Topbar from "../../components/topbar/Topbar"
import { AuthContext } from "../../context/AuthContext"
import "./messenger.css"
import axios from axios;
import {io} from "socket.io-client";

export default function Messenger() {
    const [conversations, setConversations] = useState([]);
    const [currentChat, setcurrentChat] = useState(null);
    const [messages, setmessages] = useState([]);
    const [socket, setsocket] = useState(null)
    const [newMessages, setnewMessages] = useState("");
    const [arrivalMessages, setarrivalMessages] = useState(null);
    const {user} = useContext(AuthContext);
    const scrollRef = useRef();
    const socket = useRef();

    useEffect(()=>{
        socket.current = io("ws://localhost:8900");
        socket.current.on("getMessage", data =>{
            setarrivalMessages({
                sender: data.senderId,
                text: data.text,
                createdAt: Date.now(),
            });
        });
    },[])

    useEffect(()=>{
        arrivalMessages && currentChat?.members.includes(arrivalMessages.sender) && 
        setmessages((prev)=>[...prev, arrivalMessages]);
    },[arrivalMessages, currentChat]);

    useEffecr(()=>{
        socket.current.emit("addUser", user._id);
        socket.current.on("getUsers", users=>{
            console.log(users)
        })
    },[user]);
   
    useEffect(() => {
        const getConversations = async()=>{
            try{
                const res = await axios.getConversations("/conversations/"+ user._id);
                setConversations(res.data);
            }catch(err){
                console.log(err);
            }
        }
        getConversations();
    },[user._id]);

    useEffect(()=>{
        const getMessages = async ()=> {
            try{
                const res = await axios.getConversations("/messages/" + currentChat._id);
                setmessages(res.data);
            }catch(err){
                console.log(err)
            }
        };
        getMessages()
    },[currentChat]);

    const handleSubmit = async (e)=> {
        e.preventDefault();
        const message = {
            sender: user._id,
            text: newMessages,
            conversationId: currentChat._id,
        };

        const receiverId = currentChat.members.find(member=> member !== user._id)

        socket.current.emit("sendMessage", {
            senderId: user._id,
            receiverId,
            text: newMessages,
        });

        try{
            const res = await axios.post("/messages", message);
            setmessages([...messages, res.data])
            setnewMessages("")
        }catch(err){
            console.log(err)
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages])

    return (
        <>
        <Topbar />
        <div className="messenger">
            <div className="chatMenu">
                <div className="chatMenuWrapper">
                    <input placeholder="Search for friends" className="chatMenuInput" />
                    {conversations.map((c)=> {
                        <div onClick={()=> setcurrentChat(c)}>
                            <Conversation conversation={c} currentUser={user} />
                        </div>     
                    })}
                </div>
            </div>
            <div className="chatBox">
                <div className="chatBoxWrapper">
                    {
                        currentChat ?
                    <>
                    <div className="chatBoxTop">
                        {messages.map(m=>(
                            <div ref={scrollRef}>
                            <Message  message={m} own={m.sender === user._id} />
                            </div>
                        ))}
                    </div>
                    <div className="chatBoxBottom">
                        <textarea className="chatMessageInput" placeholder="Write something..." onChange={(e)=> setnewMessages(e.targetvalue)} value={newMessages}></textarea>
                        <button className="chatSubmitButton" onClick={handleSubmit}>Send</button>
                    </div></> : <span className="noConversationText">Open a comversation to start a chat.</span>}
                </div>
            </div>
            <div className="chatOnline">
                <div className="chatOnlineWrapper">
                    <ChatOnline />
                </div>
            </div>
        </div>
        </>
    )
}
