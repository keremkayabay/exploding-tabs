function onError(error) {
    console.log(error);
}

function initiateTimer(tabId, url){
    let pathArray = url.split('/');
    let siteKey = pathArray[0] + '//' + pathArray[2];
    
    browser.storage.local.get(siteKey).then( function( results ){
        if( !results[siteKey] ){
            return;
        }
        let timer = results[siteKey].timer;
        browser.tabs.executeScript( tabId, {file: "/content_scripts/countdown.js"}).then( function() {
            browser.tabs.sendMessage(
                tabId,
                {
                    command: "start-countdown",
                    timer: timer
                }
            ).catch(onError);
            browser.pageAction.show(tabId);
        }, onError);
    }, onError);
}

function handleUpdateOnTab(tabId, changeInfo, tabInfo) {
    if (changeInfo.url) {
        initiateTimer(tabId, changeInfo.url)
    }
}

function  handleMessage(request, sender, sendResponse) {
    console.log("Message from the content script: " + request.greeting );
    browser.tabs.remove(sender.tab.id);
}

browser.pageAction.onClicked.addListener((tab) => {
    browser.tabs.sendMessage(
        tab.id,
        {
            command: "stop-countdown"
        }
    ).catch(onError);
    browser.pageAction.hide(tab.id);
});

browser.tabs.onUpdated.addListener(handleUpdateOnTab);

browser.runtime.onMessage.addListener(handleMessage);