from message import Message

class Channel():
    id = 1

    def __init__(self, name, createdBy):
        self.id = Channel.id
        self.name = name
        self.createdBy = createdBy
        self.messages = []
        self.users = 0
        # Increment the id counter
        Channel.id += 1


    def add_message(self, username, msg, is_info_message):
        """Add a new Message object to the messages list and return it. If the list has more than 100 elements the oldest element\
        will be removed"""
        if len(self.messages) > 100:
            del(self.messages[0])

        msg_object = Message(username, msg, is_info_message)
        self.messages.append(msg_object)
        return msg_object


    def add_user(self):
        self.users += 1


    def remove_user(self):
        self.users -= 1
