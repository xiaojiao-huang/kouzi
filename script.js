// 格式化消息文本（支持Markdown和Coze富媒体）
function formatMessage(text) {
    if (!text) return '';

    // 处理Markdown基本语法
    let formattedText = text
        // **粗体**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // *斜体*
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // `代码`
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // [链接](URL)
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
        // 换行转<br>
        .replace(/\n/g, '<br>');

    return formattedText;
}

// 显示消息
function displayMessage(role, message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;

    const avatar = document.createElement('img');
    avatar.src = role === 'user' ? 'user-avatar.png' : 'bot-avatar.png';
    avatar.alt = role === 'user' ? 'User' : 'Bot';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    // 检查是否是富媒体消息（如JSON）
    if (typeof message === 'object') {
        // 这里可以扩展处理Coze返回的卡片、按钮等
        messageContent.innerHTML = `<pre>${JSON.stringify(message, null, 2)}</pre>`;
    } else {
        // 普通文本消息
        messageContent.innerHTML = role === 'user' ? message : formatMessage(message);
    }

    messageElement.appendChild(avatar);
    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);

    // 平滑滚动到底部
    messageElement.scrollIntoView({ behavior: 'smooth' });
}

// 发送消息到Coze API
async function sendMessage() {
    const inputElement = document.getElementById('chat-input');
    const message = inputElement.value;
    if (!message.trim()) return;

    displayMessage('user', message);
    inputElement.value = '';

    // 显示加载动画
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }

    // Coze API配置（替换成你的实际信息）
    const COZE_API_KEY = 'pat_DSG5F7zbzeqpjvmES2kpRbatIgFbd2Tj2QaoaRak9Wz98M4FLF5WMmJcw2dZRZX7';
    const BOT_ID = '7485764804163682319';
    const endpoint = 'https://www.coze.cn/space/7482777086366154788/bot'; // Coze API地址

    const payload = {
        bot_id: BOT_ID,
        user: "user123", // 可自定义用户ID
        query: message,
        stream: false, // 是否流式响应
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${COZE_API_KEY}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        // 隐藏加载动画
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        // 解析Coze返回的消息（根据实际API调整）
        if (data.messages && data.messages.length > 0) {
            const botResponse = data.messages[0].content;
            displayMessage('bot', botResponse);
        } else {
            displayMessage('bot', '出错了，请稍后再试。');
        }
    } catch (error) {
        // 隐藏加载动画
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        displayMessage('bot', '出错了，请稍后再试。');
        console.error('Error:', error);
    }
}

// 主题切换功能
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const chatContainer = document.querySelector('.chat-container');
    const messages = document.querySelector('.messages');

    chatContainer.classList.toggle('dark-mode');
    messages.classList.toggle('dark-mode');

    // 保存主题设置
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// 下拉菜单功能
function toggleDropdown(event) {
    event.preventDefault();
    document.getElementById('dropdownMenu').classList.toggle('show');
}

// 点击其他地方关闭下拉菜单
window.onclick = function (event) {
    if (!event.target.matches('.dropdown button')) {
        const dropdowns = document.getElementsByClassName('dropdown-content');
        for (const dropdown of dropdowns) {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    }
}

// 回车发送消息
document.getElementById('chat-input').addEventListener('keypress', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// 初始化主题
document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('.chat-container').classList.add('dark-mode');
        document.querySelector('.messages').classList.add('dark-mode');
    }
});