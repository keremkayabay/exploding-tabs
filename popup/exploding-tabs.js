function onError(error) {
    console.log(error);
}

function incrementTimer(){
    let siteKey = this.dataset.siteKey;

    browser.storage.local.get(siteKey).then( function( results ){
        timer = results[siteKey].timer;
        timer += 60;
        browser.storage.local.set({
            [siteKey]: {timer: timer}
        }).then(updateExplodingSites,onError);
    }, onError);
}

function decrementTimer(){
    let siteKey = this.dataset.siteKey;

    browser.storage.local.get(siteKey).then( function( results ){
        timer = results[siteKey].timer;
        timer -= 60;
        if( timer > 0 ){
            browser.storage.local.set({
                [siteKey]: {timer: timer}
            }).then(updateExplodingSites,onError);
        }
    }, onError);
}

function addExplodingSite() { //add active tab to exploding sites
    browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
        let tab = tabs[0]; // Safe to assume there will only be one result
        let pathArray = tab.url.split('/');
        let siteKey = pathArray[0] + '//' + pathArray[2];
        browser.storage.local.set({
            [siteKey]: {timer: 300}
        }).then(updateExplodingSites,onError);
    }, onError);
}

function updateExplodingSites(){
    browser.storage.local.get(null).then( function( results ){
        let explodingSites = document.getElementById("exploding-sites");
        explodingSites.innerHTML = "";
        let keys = Object.keys(results);
        for(let siteKey of keys){
            let explodingSite = document.createElement("div");
            let site = document.createElement("div");
            let timer = document.createElement("div");
            let increment = document.createElement("div");
            let decrement = document.createElement("div");

            explodingSite.classList.add('exploding-site');
            site.classList.add('site');
            timer.classList.add('timer');

            increment.classList.add('button');
            decrement.classList.add('button');

            site.classList.add('float-left');
            timer.classList.add('float-left');
            increment.classList.add('float-left');
            decrement.classList.add('float-left');

            increment.classList.add('ml-5');

            increment.dataset.siteKey = siteKey;
            decrement.dataset.siteKey = siteKey;

            increment.addEventListener("click",incrementTimer);
            decrement.addEventListener("click",decrementTimer);

            site.textContent = siteKey;
            timer.textContent = results[siteKey].timer;
            increment.textContent = "+";
            decrement.textContent = "-";

            explodingSite.appendChild(site);
            explodingSite.appendChild(timer);
            explodingSite.appendChild(decrement);
            explodingSite.appendChild(increment);

            explodingSites.append(explodingSite);
        }
        //document.getElementById("exploding-sites").innerHTML = "";
        //document.getElementById("exploding-sites").innerHTML = explodingSites.innerHTML;
    }, onError);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("add-exploding-site").addEventListener("click", addExplodingSite);
});

//browser.storage.local.clear();
updateExplodingSites();