console.log("Email Writer Extension Loaded");
function createAIButton() {
const button = document.createElement('div');
button.className= 'T-I J-J5-Ji aoO v7 T-I-atl L3';
button.style.marginRight= '8px';
button.setAttribute('role', 'button');
button.setAttribute('data-tooltip', 'Generate AI Reply');
button.innerHTML= 'AI reply';
return button;
}
function getemailcontent() {
const Selectors= [
        '.h7',
        '.a3s.aiL',
        '[role="presentation"]',
        '.gmail_quote'
    ];

    for(const selector of Selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
        return '';

    }
}
function findComposeToolbar() {
const Selectors= [
        '.btC',
        '.aDh',
        '[role="dialog"]',
        '.gU.Up'
    ];

    for(const selector of Selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
        return null;

    }
}
function injectButton() {
    const existingButton = document.querySelector('.email-writer-button');
    if (existingButton) existingButton.remove();
    const toolbar= findComposeToolbar();
    if (toolbar) {
        console.log("Toolbar not found");
        return;
    }
    console.log("Toolbar found, creating AI button");
    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async() => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;
            const emailcontent = getemailcontent();
             const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', },
                    body : JSON.stringify({ emailContent: emailcontent ,
                        tone : 'professional'
                     }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const generatedreply = await response.text();
            const composebox = document.querySelector('[role="textbox"][g_editable="true"]');
            if (composebox) {
                composebox.focus();
                document.execCommand('insertText', false, generatedreply);

            }
            else{
                console.error("Compose box not found");
            }


            
        } catch (error) {
            console.error('Error generating AI reply:', error);
        }
        finally{
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
});

toolbar.insertBefore(button, toolbar.firstChild);

}
const Observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from( mutation.addedNodes);
        const hasComposeElement = addedNodes.some(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            (node.matches('.aDh, .btC,[role="dialog"] ') || node.querySelector('.aDh, .btC,[role="dialog"] '))
        );
    }
    if (hasComposeElement) {
        console.log("Compose window detected");
        // Additional logic for handling the compose window can be added here
        setTimeout(injectButton, 500);

    }

});


Observer.observe(document.body, { childList: true, subtree: true });