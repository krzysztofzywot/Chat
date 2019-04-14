from datetime import datetime

class Message():

    def __init__(self, username, message, is_info_message):
        self.date = datetime.now().strftime("%A %d %b, %H:%M:%S")
        self.username = username
        self.message = message
        self.is_info_message = is_info_message
