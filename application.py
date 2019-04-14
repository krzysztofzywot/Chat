from flask import Flask, render_template, request, redirect, url_for, request
from flask_socketio import SocketIO, emit, join_room, leave_room

from channel import Channel

app = Flask(__name__)
app.config["SECRET_KEY"] = "g3eZ!gHjnm351hde38bV"
socketio = SocketIO(app)

# Keys are channel ids and values are Channel objects
channels = {}
# Keys are channel ids and values are lists of dictionaries that contain keys: "username" and "seesionid"
users = {}

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/create", methods=["GET", "POST"])
def create_room():
    if request.method == "GET":
        return render_template("create_channel.html")
    else:
        # Create a new channel
        channel_name = request.form["channelName"]
        username = request.form["username"]
        channel = Channel(channel_name, username)
        channels[channel.id] = channel

        return redirect(url_for("view_channel", id=channel.id))


@app.route("/validate/<name>", methods=["POST"])
def validate_name(name):
    """Check whether channel name submitted by user is not already taken"""
    for channel in channels.values():
        if channel.name == name:
            return "false"

    return "true"


@app.route("/channels")
def channels_list():
    """Show a list of all open channels in order from most recently created"""
    return render_template("channel_list.html", channels=sorted(channels.values(), key=lambda channel: channel.id, reverse=True))


@app.route("/channel/<int:id>")
def view_channel(id):
    """Show the channel"""
    # Look for channel in the dict
    selected_channel = channels[id]

    if not selected_channel:
        return "There is no open channel with this id."

    return render_template("channel_view.html", channelName=selected_channel.name, messages=selected_channel.messages)


@socketio.on("join")
def on_join(data):
    username = data["username"]
    channel_id = int(data["channelId"])

    # Get the users that are already in this channel and append the newly joined user. If there are none yet, add new
    # channel to the dictionary and add empty list as its value.
    userSID = request.sid
    users_in_channel = users.setdefault(channel_id, [])
    users_in_channel.append({"username": username, "sessionid": userSID})

    # Get the channel object, which user has joined, increase the user count and append a new message to it
    selected_channel = channels[channel_id]
    selected_channel.add_user()
    message = selected_channel.add_message(username, f"{username} has joined the channel.", True)

    join_room(channel_id)
    emit("displayMessage", {"message": message.message, "isInfoMessage": message.is_info_message}, room=channel_id)


@socketio.on("leave")
def on_leave(data):
    username = data["username"]
    channel_id = int(data["channelId"])

    # Remove the user from channels user list
    users_in_channel = users[channel_id]
    users[channel_id] = [u for u in users_in_channel if u.get("username") != username]

    # Get the channel object, which user has joined, reduce the user count and append a new message to it
    selected_channel = channels[channel_id]
    selected_channel.remove_user()
    message = selected_channel.add_message(username, f"{username} has left the channel.", True)

    leave_room(channel_id)
    emit("displayMessage", {"message": message.message, "isInfoMessage": message.is_info_message}, room=channel_id)


@socketio.on("sendMessage")
def on_message_sent(data):
    username = data["username"]
    channel_id = int(data["channelId"])
    message = data["message"]

    # Get the channel object, which user has joined and append a new message to it
    selected_channel = channels[channel_id]
    message = selected_channel.add_message(username, message, False)

    emit("displayMessage", {"username": username, "message": message.message, "date": message.date,
     "isInfoMessage": message.is_info_message}, room=channel_id)


if __name__ == '__main__':
    socketio.run(app)
