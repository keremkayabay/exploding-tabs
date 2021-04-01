function onError(error) {
    console.log(error);
}

async function getConfig(key) {
    const storeKey = "config-" + key;
    const data = await browser.storage.local.get(storeKey);
    return data[storeKey];
}

function initiateTimer(tabId, url){
    let pathArray = url.split('/');
    let siteKey = pathArray[0] + '//' + pathArray[2];
    
    browser.storage.local.get(siteKey).then( async function( results ){
        if( !results[siteKey] ){
            return;
        }
        let timer = results[siteKey].timer;
        let renameTab = await getConfig("renameTab")=="true";
        let notificationOnStart = await getConfig("notificationOnStart")=="true";
        browser.tabs.executeScript( tabId, {file: "/content_scripts/countdown.js"}).then( function() {
            browser.tabs.sendMessage(
                tabId,
                {
                    command: "start-countdown",
                    timer: timer,
                    renameTab: renameTab,
                    notificationOnStart: notificationOnStart,
                }
            ).catch(onError);
            browser.pageAction.show(tabId);
        }, onError);
    }, onError);
}

function notify( message ){
    browser.notifications.clear("destruction-notification");

    browser.notifications.create("destruction-notification", {
        "type": "basic",
        "title": "Exploding Tabs",
        "iconUrl": "icons/bomb-solid-48.png",
        "message": message
    });
}

function handleUpdateOnTab(tabId, changeInfo, tabInfo) {
    if (changeInfo.url) {
        initiateTimer(tabId, changeInfo.url)
    }
}

function handleMessage(request, sender, sendResponse) {
    if( request.command == "boom" ){
        browser.tabs.remove(sender.tab.id);
    }
    else if( request.command == "notify" ){
        if( sender.tab.active ){
            notify( request.message );
        }
    }
}

browser.pageAction.onClicked.addListener((tab) => {
    browser.tabs.sendMessage(
        tab.id,
        {
            command: "stop-countdown"
        }
    ).catch(onError);
    browser.notifications.clear("destruction-notification");
    browser.pageAction.hide(tab.id);
});

browser.tabs.onUpdated.addListener(handleUpdateOnTab);

browser.runtime.onMessage.addListener(handleMessage);