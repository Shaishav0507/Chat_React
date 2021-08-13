import ChatOnline from "../../components/chatOnline/ChatOnline"
import chatOnline from "../../components/chatOnline/ChatOnline"
import Conversation from "../../components/conversations/Conversation"
import Message from "../../components/message/Message"
import Topbar from "../../components/topbar/Topbar"
import { AuthContext } from "../../context/AuthContext"
import "./messenger.css"
import axios from axios;

export default function Messenger() {
    const [conversations, setConversations] = useState([]);
    const [currentChat, setcurrentChat] = useState(null);
    const [messages, setmessages] = useState([]);
    const {user} = useContext(AuthContext);

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
                            <Message  message={m} own={m.sender === user._id} />
                        ))}
                    </div>
                    <div className="chatBoxBottom">
                        <textarea className="chatMessageInput" placeholder="Write something..."></textarea>
                        <button className="chatSubmitButton">Send</button>
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
