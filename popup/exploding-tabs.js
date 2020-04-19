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

function removeSite(){
    let siteKey = this.dataset.siteKey;

    browser.storage.local.remove(siteKey).then( updateExplodingSites, onError );
}

function addExplodingSite() { //add active tab to exploding sites
    browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
        let tab = tabs[0]; // Safe to assume there will only be one result
        let pathArray = tab.url.split('/');
        let siteKey = pathArray[0] + '//' + pathArray[2];
        browser.storage.local.set({
            [siteKey]: {timer: 180}
        }).then(updateExplodingSites,onError);
    }, onError);
}

function updateExplodingSites(){
    browser.storage.local.get(null).then( function( results ){
        let explodingSites = document.getElementById("exploding-sites");
        explodingSites.textContent = "";
        let keys = Object.keys(results);
        for(let siteKey of keys){
            let explodingSite = document.createElement("div");
            let site = document.createElement("div");
            let timer = document.createElement("div");
            let increment = document.createElement("div");
            let decrement = document.createElement("div");
            let remove = document.createElement("div");

            explodingSite.classList.add('exploding-site');
            site.classList.add('site');
            timer.classList.add('timer');

            increment.classList.add('button');
            increment.classList.add('button-small');
            decrement.classList.add('button');
            decrement.classList.add('button-small');
            remove.classList.add('button');
            remove.classList.add('button-small');

            site.classList.add('float-left');
            timer.classList.add('float-left');
            increment.classList.add('float-right');
            decrement.classList.add('float-right');
            remove.classList.add('float-left');

            increment.dataset.siteKey = siteKey;
            decrement.dataset.siteKey = siteKey;
            remove.dataset.siteKey = siteKey;

            decrement.addEventListener("click",decrementTimer);
            increment.addEventListener("click",incrementTimer);
            remove.addEventListener("click",removeSite);

            site.textContent = siteKey;
            timer.textContent = results[siteKey].timer;
            increment.innerHTML = Sanitizer.escapeHTML`<i class="fas fa-plus"></i>`;
            decrement.innerHTML = Sanitizer.escapeHTML`<i class="fas fa-minus"></i>`;
            remove.innerHTML = Sanitizer.escapeHTML`<i class="fas fa-trash-alt"></i>`;

            explodingSite.appendChild(remove);
            explodingSite.appendChild(site);
            explodingSite.appendChild(timer);
            explodingSite.appendChild(increment);
            explodingSite.appendChild(decrement);

            explodingSites.append(explodingSite);
        }
    }, onError);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("add-exploding-site").addEventListener("click", addExplodingSite);
});

//browser.storage.local.clear();
updateExplodingSites();