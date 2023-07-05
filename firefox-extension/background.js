

function connect() {
  let logiCraftSocket = new WebSocket('ws://127.0.0.1:9001')
  // let logiCraftSocket = new WebSocket('ws://127.0.0.1:10134')
  // console.log(logiCraftSocket)



  function sendDataToActiveTab(data) {
    browser.tabs.query({active: true, currentWindow: true})
        .then(tabs => {
          const tabId = tabs[0].id;
          browser.tabs.sendMessage(tabId, data);
        })
        .catch(error => {
          console.error("Error querying active tab:", error);
        })
  }


  function AlltabsProcessor(json_data) {
    if (json_data.ratchet_delta > 0) {
      switchTabRight()
    } else if (json_data.ratchet_delta < 0) {
      switchTabLeft()
    }
  }

  function ChangeChapter(json_data) {
    if (json_data.ratchet_delta > 0) {
      let data = {craft: {type: 'rewind', value: '+'}}
      sendDataToActiveTab(data)
    } else if (json_data.ratchet_delta < 0) {
      let data = {craft: {type: 'rewind', value: '-'}}
      sendDataToActiveTab(data)
    }
  }

  function ChangeSpeed(json_data) {
    if (json_data.ratchet_delta > 0) {
      let data = {craft: {type: 'speed', value: '+'}}
      sendDataToActiveTab(data)
    } else if (json_data.ratchet_delta < 0) {
      let data = {craft: {type: 'speed', value: '-'}}
      sendDataToActiveTab(data)
    }
  }

  function Timeline(json_data) {
    let data = {craft: {type: 'timeline', value: json_data.delta}}
    sendDataToActiveTab(data)
  }

  function YoutubeProcessor(json_data) {
    switch (json_data.task_options.current_tool_option) {
      case 'ychangetab':
        AlltabsProcessor(json_data)
        break
      case 'changechapter':
        ChangeChapter(json_data)
        break
      case 'changespeed':
        ChangeSpeed(json_data)
        break
      case 'timeline':
        Timeline(json_data)
        break
    }
  }


  function TurnProcessor(json_data) {
    switch (json_data.task_options.current_tool) {
      case 'Alltabs':
        AlltabsProcessor(json_data)
        break
      case 'Youtube':
        YoutubeProcessor(json_data)
        break
    }
  }


  function messageTypeProcessor(json_data) {
    switch (json_data.message_type) {
      case "crown_turn_event":
        TurnProcessor(json_data)
        break
    }
  }


  logiCraftSocket.onmessage = (event) => {
    let json_data = JSON.parse(event.data)
    messageTypeProcessor(json_data)
  }

  logiCraftSocket.onclose = (event) => {
    console.log('WebSocket connection closed with code:', event.code);
    console.log('Reconnecting...');
    setTimeout(connect, 2000);
  };


  browser.runtime.onMessage.addListener(function (message) {
    logiCraftSocket.send(JSON.stringify(message))
  });


  function checkPage(tab) {
    let pageUrl = tab.url
    const url = new URL(pageUrl)
    const extractedURL = url.hostname
    let data = {action_type: 'change_tool'}
    if (extractedURL === 'www.youtube.com') {
      data.value = 'Youtube'
    } else {
      data.value = 'Alltabs'
    }
    logiCraftSocket.send(JSON.stringify(data))

  }

  function switchTabLeft() {
    chrome.tabs.query({currentWindow: true}, (tabs) => {
      const currentTab = tabs.find((tab) => tab.active);

      if (currentTab) {
        const currentIndex = currentTab.index;

        if (currentIndex > 0) {
          const newIndex = currentIndex - 1;
          chrome.tabs.update(tabs[newIndex].id, {active: true});
        }
      }
    });
  }

  function switchTabRight() {
    chrome.tabs.query({currentWindow: true}, (tabs) => {
      const currentTab = tabs.find((tab) => tab.active);

      if (currentTab) {
        const currentIndex = currentTab.index;
        const lastIndex = tabs.length - 1;

        if (currentIndex < lastIndex) {
          const newIndex = currentIndex + 1;
          chrome.tabs.update(tabs[newIndex].id, {active: true});
        }
      }
    });
  }


  browser.tabs.onActivated.addListener(function (activeInfo) {
    browser.tabs.get(activeInfo.tabId)
        .then(function (tab) {
          checkPage(tab);
        });
  })

}

connect()