import json
import time

import websocket
import threading
import psutil
from websocket_server import WebsocketServer


def get_firefox_pid():
    for process in psutil.process_iter(['pid', 'name']):
        if 'firefox.exe' in process.info['name'].lower():
            parent = process.parent()
            if not parent:
                return process.pid
            else:
                return parent.pid


class CraftClient(object):
    def crown_turn_event(self, ws, message, message_row):
        server.send_message_to_all(message_row)
    def crown_touch_event(self, ws, message, message_row):
        server.send_message_to_all(message_row)
    def activate_plugin(self, ws, message, message_row):
        print(message)
    def deactivate_plugin(self, ws, message, message_row):
        print(message)
    def register_ack(self, ws, message, message_row):
        self.session_id = message.get('session_id')
        defaultTool = "Alltabs"
        self.last_tool = defaultTool
        connectMessage = {
            "message_type": "tool_change",
            "session_id": self.session_id,
            "tool_id": defaultTool
        }
        regMsg = json.dumps(connectMessage)
        ws.send(regMsg.encode('utf8'))

    def handle_message(self, ws, message, message_row):
        type_func_list = {
            'register_ack': self.register_ack,
            'deactivate_plugin': self.deactivate_plugin,
            'activate_plugin': self.activate_plugin,
            'crown_touch_event': self.crown_touch_event,
            'crown_turn_event': self.crown_turn_event,
        }
        msg_type = message.get('message_type')
        to_exec = type_func_list.get(msg_type)
        return to_exec(ws, message, message_row)

    def __init__(self):
        self.executableName=""
        self.manifestPath=""
        self.callback=""
        self.last_tool=""

    def on_message(self,ws, message):
        print("on_message called...")
        # craft events come in as json objects
        craftEventObj = json.loads(message)
        print(craftEventObj)
        self.handle_message(ws, craftEventObj, message)

    def on_close(self, ws, *args):
        print("### closed ###")
        time.sleep(5)
        self.connect('firefox.exe', '')

    def on_open(self,ws):
        print("on_open called...")
        uid = "3614ae5a-f1d8-4d33-b71c-e6038ed3f680"
        # pid = os.getpid()
        pid = get_firefox_pid()
        print('PID:', pid)

        connectMessage = {
            "message_type": "register",
            "plugin_guid": uid,
            "PID": pid,
            "execName": self.executableName,
            "manifestPath": self.manifestPath,
            "application_version": "0.0.0"
        }

        regMsg = json.dumps(connectMessage)
        ws.send(regMsg.encode('utf8'))

    def connect(self, execName, manifestFilePath):
        print("connect called...")
        global ws
        self.executableName = execName
        self.manifestPath = manifestFilePath

        websocket.enableTrace(True)

        ws = websocket.WebSocketApp("ws://127.0.0.1:10134",
                                 on_open=self.on_open,
                                 on_message=self.on_message,
                                 on_close=self.on_close)
        wst = threading.Thread(target=ws.run_forever)
        wst.daemon = True
        wst.start()


    def changeTool(self, name):
        connectMessage = {
            "message_type": "tool_change",
            "session_id": self.session_id,
            "tool_id": name
        }
        regMsg =  json.dumps(connectMessage)
        ws.send(regMsg.encode('utf8'))

    def report(self, toolId, tool_name, value):
        # toolId = event.get('task_options').get('current_tool')
        # na = event.get('task_options').get('current_tool_option')

        response = {
            "message_type": "tool_update",
            "session_id":  self.session_id,
            "show_overlay":  True,
            "tool_id":  toolId,
            "tool_options":  [{
                "name": tool_name,
                "value": value
            }]
        }
        regMsg = json.dumps(response)
        ws.send(regMsg.encode('utf8'))



craft_client = CraftClient()
craft_client.connect('firefox.exe', '')


def new_client(client, server):
	print("New client connected and was given id %d" % client['id'])
	server.send_message_to_all("{}")


def client_left(client, server):
	print("Client(%d) disconnected" % client['id'])


def change_tool_processor(message):
    new_tool = message.get('value')
    if craft_client.last_tool != new_tool:
        craft_client.changeTool(new_tool)
        craft_client.last_tool = new_tool

def report_processor(message):
    tool_id = message.get('tool_id')
    tool_name = message.get('tool_name')
    value = message.get('value')
    if tool_id == 'Youtube' and tool_name == 'changespeed':
        value *= 10
        value = int(value)
    craft_client.report(tool_id, tool_name, value)

def message_processor(message):
    if message.get('action_type') == 'change_tool':
        change_tool_processor(message)
    elif message.get('action_type') == 'report':
        report_processor(message)


def message_received(client, server, message):
    msg = json.loads(message)
    message_processor(msg)


PORT = 9001
server = WebsocketServer(port=PORT)
server.set_fn_new_client(new_client)
server.set_fn_client_left(client_left)
server.set_fn_message_received(message_received)
server.run_forever()

