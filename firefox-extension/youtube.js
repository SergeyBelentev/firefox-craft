
function wait(t) {
    return new Promise(r => setTimeout(r, t));
}

async function getApp() {
    while (true) {

        /** @type {HTMLElement} */
        const app = document.body.querySelector('#content ytd-watch-flexy');

        if (app !== null) {
            return app;
        }

        await wait(100);
    }
}


getApp().then(/** @type {HTMLElement} */app => {

    async function descriptionLoaded() {
        while (true) {
            /** @type {HTMLElement} */
            const description = app.querySelector('#description.ytd-expandable-video-description-body-renderer[slot="content"]');
            if (description !== null && description.textContent.trim() !== '') {
                return description;
            }
            await wait(100);
        }
    }

    function findChapters(el) {
        const id = new URL(location.href).searchParams.get('v');
        return Array
            .from(el.querySelectorAll('a[href*="/watch"][href*="t="][href*="v=' + id + '"]'))
            .map(a => {
                const u = new URL(a.href);
                const time = u.searchParams.get('t');
                return parseInt(time, 10);
            })
            .filter(t => !isNaN(t) && t > 0);
    }

    async function getChapters() {
        const markersList = document.querySelector('ytd-macro-markers-list-renderer')
        let chapters = []
        if (markersList) {
            chapters = findChapters(markersList)
        }

        // If no chapters in "chapters" widget search it in regular description
        if (chapters.length === 0) {
            const description = await descriptionLoaded()
            chapters = findChapters(description)
        }

		return chapters
    }

    function getClosestChapter(times, currentTime) {
        return Math.min(...times.filter(t => t > currentTime));
    }
    function getClosestChapterReverse(times, currentTime) {
        return Math.max(...times.filter(t => t < currentTime));
    }

    function Rewind(message, video, times) {
        if (message.craft.value === "+") {
          const nextTime = getClosestChapter(times, video.currentTime);
          if (nextTime > video.currentTime && nextTime < video.duration) {
              video.currentTime = nextTime;
          }
        } else if (message.craft.value === "-") {
            const prevTime = getClosestChapterReverse(times, video.currentTime);
            if (prevTime < video.currentTime) {
              video.currentTime = prevTime;
            }
        }
    }

    function Speed(message, video) {
        if (message.craft.value === "+") {
            curr_video_speed = curr_video_speed + 0.1
        } else if (message.craft.value === "-") {
            curr_video_speed = curr_video_speed - 0.1
        }
        video.playbackRate = curr_video_speed
        let data = {
            action_type: 'report',
            tool_id: 'Youtube',
            tool_name: 'changespeed',
            value: curr_video_speed,
        }
        browser.runtime.sendMessage(data);
    }

    function Timeline(message, video) {
        video.currentTime += message.craft.value
    }

    function CraftMessageProcessor(message, video, times) {
        switch (message.craft.type) {
            case 'rewind':
                Rewind(message, video, times)
                break
            case 'speed':
                Speed(message, video)
                break
            case 'timeline':
                Timeline(message, video)
                break
        }
    }


    let curr_video_speed = 1
    async function main() {
        const isWatchPage = app.hasAttribute('video-id') && !app.hidden;
        if (!isWatchPage) {
            return;
        }

        const times = await getChapters();
        const video = app.querySelector('#ytd-player video')

        browser.runtime.onMessage.addListener(message => {
            CraftMessageProcessor(message, video, times)
        });

    }


    main().catch(console.error);
    const mainObserver = new MutationObserver(main);
    mainObserver.observe(app, {attributeFilter: ['video-id', 'hidden']});
});
