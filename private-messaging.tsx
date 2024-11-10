import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  _id: string
  sender: string
  receiver: string
  content: string
  createdAt: string
}

interface Friend {
  _id: string
  username: string
  profilePicture: string
}

export default function PrivateMessaging() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    fetchFriends()
  }, [])

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend._id)
    }
  }, [selectedFriend])

  const fetchFriends = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/friends', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })
      if (response.ok) {
        const friendsData = await response.json()
        setFriends(friendsData)
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
    }
  }

  const fetchMessages = async (friendId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${friendId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })
      if (response.ok) {
        const messagesData = await response.json()
        setMessages(messagesData)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFriend) return

    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          receiver: selectedFriend._id,
          content: newMessage,
        }),
      })
      if (response.ok) {
        setNewMessage('')
        fetchMessages(selectedFriend._id)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Friends</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className={`flex items-center space-x-4 mb-4 p-2 rounded-lg cursor-pointer ${selectedFriend?._id === friend._id ? 'bg-muted' : ''}`}
                  onClick={() => setSelectedFriend(friend)}
                >
                  <Avatar>
                    <AvatarImage src={friend.profilePicture || `https://api.dicebear.com/6.x/initials/svg?seed=${friend.username}`} alt={friend.username} />
                    <AvatarFallback>{friend.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{friend.username}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{selectedFriend ? `Chat with ${selectedFriend.username}` : 'Select a friend to start chatting'}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFriend && (
              <>
                <ScrollArea className="h-[400px] mb-4">
                  {messages.map((message) => (
                    <div key={message._id} className={`mb-2 ${message.sender === selectedFriend._id ? 'text-left' : 'text-right'}`}>
                      <div className={`inline-block p-2 rounded-lg ${message.sender === selectedFriend._id ? 
                        'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
                        {message.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow"
                  />
                  <Button type="submit">Send</Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}