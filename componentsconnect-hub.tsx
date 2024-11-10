'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Bell, Heart, MessageCircle, Share2, Search, LogOut, Send, UserPlus, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip } from "@/components/ui/tooltip"

interface User {
  _id: string
  username: string
  email: string
  bio?: string
  followers: string[]
  following: string[]
}

interface Post {
  _id: string
  user: User
  content: string
  createdAt: string
  likes: string[]
  comments: Comment[]
}

interface Comment {
  _id: string
  user: User
  content: string
  createdAt: string
}

interface Message {
  _id: string
  sender: User
  receiver: User
  content: string
  createdAt: string
}

export function ConnectHub() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [newComment, setNewComment] = useState('')
  const [activeTab, setActiveTab] = useState('feed')
  const [token, setToken] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [searchedUsers, setSearchedUsers] = useState<User[]>([])
  const [notifications, setNotifications] = useState<string[]>([])
  const [chatPartner, setChatPartner] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [friendSuggestions, setFriendSuggestions] = useState<User[]>([])

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotifications(prev => [...prev, message])
    setTimeout(() => setNotifications(prev => prev.slice(1)), 3000)
  }

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${localStorage.getItem('userId')}`, {
        headers: { 'Authorization': token },
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      showNotification("Failed to fetch user data", 'error')
    }
  }, [token])

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
        headers: { 'Authorization': token },
      })
      if (response.ok) {
        const postsData = await response.json()
        setPosts(postsData)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      showNotification("Failed to fetch posts", 'error')
    }
  }, [token])

  const fetchMessages = useCallback(async () => {
    if (!chatPartner) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${chatPartner._id}`, {
        headers: { 'Authorization': token },
      })
      if (response.ok) {
        const messagesData = await response.json()
        setMessages(messagesData)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      showNotification("Failed to fetch messages", 'error')
    }
  }, [token, chatPartner])

  const searchUsers = useCallback(async () => {
    if (!userSearchTerm) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/search?query=${userSearchTerm}`, {
        headers: { 'Authorization': token },
      })
      if (response.ok) {
        const usersData = await response.json()
        setSearchedUsers(usersData)
      }
    } catch (error) {
      console.error('Error searching users:', error)
      showNotification("Failed to search users", 'error')
    }
  }, [token, userSearchTerm])

  const fetchFriendSuggestions = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/suggestions`, {
        headers: { 'Authorization': token },
      })
      if (response.ok) {
        const suggestionsData = await response.json()
        setFriendSuggestions(suggestionsData)
      }
    } catch (error) {
      console.error('Error fetching friend suggestions:', error)
      showNotification("Failed to fetch friend suggestions", 'error')
    }
  }, [token])

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      fetchUser()
      fetchPosts()
      fetchFriendSuggestions()
    }
  }, [fetchUser, fetchPosts, fetchFriendSuggestions])

  useEffect(() => {
    if (chatPartner) {
      fetchMessages()
    }
  }, [chatPartner, fetchMessages])

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    if (userSearchTerm) {
      const delayDebounceFn = setTimeout(() => {
        searchUsers()
      }, 300)
      return () => clearTimeout(delayDebounceFn)
    } else {
      setSearchedUsers([])
    }
  }, [userSearchTerm, searchUsers])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        localStorage.setItem('userId', data.userId)
        setToken(data.token)
        fetchUser()
        fetchPosts()
        fetchFriendSuggestions()
        showNotification("Logged in successfully")
      } else {
        showNotification("Invalid credentials", 'error')
      }
    } catch (error) {
      console.error('Error logging in:', error)
      showNotification("Failed to log in", 'error')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    setToken('')
    setUser(null)
    setPosts([])
    showNotification("Logged out successfully")
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: registerUsername, email: registerEmail, password: registerPassword }),
      })
      if (response.ok) {
        showNotification("Registered successfully. Please log in.")
        setActiveTab('login')
      } else {
        const errorData = await response.json()
        showNotification(errorData.message || "Registration failed", 'error')
      }
    } catch (error) {
      console.error('Error registering:', error)
      showNotification("Failed to register", 'error')
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ content: newPost }),
      })
      if (response.ok) {
        setNewPost('')
        fetchPosts()
        showNotification("Post created successfully")
      } else {
        showNotification("Failed to create post", 'error')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      showNotification("Failed to create post", 'error')
    }
  }

  const handleCreateComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ content: newComment }),
      })
      if (response.ok) {
        setNewComment('')
        fetchPosts()
        showNotification("Comment added successfully")
      } else {
        showNotification("Failed to add comment", 'error')
      }
    } catch (error) {
      console.error('Error creating comment:', error)
      showNotification("Failed to add comment", 'error')
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': token },
      })
      if (response.ok) {
        fetchPosts()
        showNotification("Post liked successfully")
      } else {
        showNotification("Failed to like post", 'error')
      }
    } catch (error) {
      console.error('Error liking post:', error)
      showNotification("Failed to like post", 'error')
    }
  }

  const handleFollow = async (userId: string) => {
    if (!userId) {
      showNotification("Invalid user to follow", 'error')
      return
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${userId}/follow`, {
        method: 'POST',
        headers: { 'Authorization': token },
      })
      if (response.ok) {
        fetchUser()
        fetchPosts()
        fetchFriendSuggestions()
        showNotification("User followed successfully")
      } else {
        showNotification("Failed to follow user", 'error')
      }
    } catch (error) {
      console.error('Error following user:', error)
      showNotification("Failed to follow user", 'error')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatPartner) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ receiverId: chatPartner._id, content: newMessage }),
      })
      if (response.ok) {
        setNewMessage('')
        fetchMessages()
      } else {
        showNotification("Failed to send message", 'error')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showNotification("Failed to send message", 'error')
    }
  }

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!token) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">ConnectHub</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">Login</Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Username"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">Register</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card className="mb-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold">Welcome, {user?.username}!</CardTitle>
                <div className="flex items-center space-x-4">
                  <Tooltip content="Toggle dark mode">
                    <Switch
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                      aria-label="Toggle dark mode"
                    />
                  </Tooltip>
                  <Tooltip content="Notifications">
                    <Bell className="cursor-pointer" onClick={() => setNotifications([])} />
                  </Tooltip>
                  {notifications.length > 0 && (
                    <Badge variant="destructive">{notifications.length}</Badge>
                  )}
                  <Tooltip content="Logout">
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  required
                />
                <Button type="submit">Post</Button>
              </form>
            </CardContent>
          </Card>

          {filteredPosts.map((post) => (
            <Card key={post._id} className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${post.user?.username || 'unknown'}`} />
                      <AvatarFallback>{post.user?.username?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{post.user?.username || 'Unknown User'}</CardTitle>
                      <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {user && post.user && user._id !== post.user._id && (
                    <div className="space-x-2">
                      <Tooltip content={user.following.includes(post.user._id) ? 'Unfollow' : 'Follow'}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFollow(post.user._id)}
                        >
                          {user.following.includes(post.user._id) ? 'Unfollow' : 'Follow'}
                        </Button>
                      </Tooltip>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Tooltip content="Chat with user">
                            <Button variant="outline" size="sm">Chat</Button>
                          </Tooltip>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Chat with {post.user.username}</DialogTitle>
                          </DialogHeader>
                          <div className="h-[300px] overflow-y-auto mb-4">
                            {messages.map((message) => (
                              <div key={message._id} className={`mb-2 ${message.sender._id === user._id ? 'text-right' : 'text-left'}`}>
                                <p className="inline-block bg-primary text-primary-foreground rounded-lg px-3 py-2">
                                  {message.content}
                                </p>
                              </div>
                            ))}
                          </div>
                          <form onSubmit={handleSendMessage} className="flex space-x-2">
                            <Input
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type a message..."
                              className="flex-grow"
                            />
                            <Tooltip content="Send message">
                              <Button type="submit">
                                <Send className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p>{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Tooltip content="Like post">
                  <Button variant="ghost" size="sm" onClick={() => handleLike(post._id)}>
                    <Heart className={`mr-2 h-4 w-4 ${post.likes.includes(user?._id ?? '') ? 'fill-red-500' : ''}`} />
                    {post.likes.length}
                  </Button>
                </Tooltip>
                <Tooltip content="View comments">
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {post.comments.length}
                  </Button>
                </Tooltip>
                <Tooltip content="Share post">
                  <Button variant="ghost" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </Tooltip>
              </CardFooter>
              <CardContent>
                <div className="space-y-4">
                  {post.comments.map((comment) => (
                    <div key={comment._id} className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${comment.user?.username || 'unknown'}`} />
                        <AvatarFallback>{comment.user?.username?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{comment.user?.username || 'Unknown User'}</p>
                        <p>{comment.content}</p>
                        <p className="text-sm text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  <form onSubmit={(e) => handleCreateComment(e, post._id)} className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    />
                    <Tooltip content="Post comment">
                      <Button type="submit">Comment</Button>
                    </Tooltip>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Find Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchedUsers.length > 0 && (
                <div className="space-y-4">
                  {searchedUsers.map((searchedUser) => (
                    <div key={searchedUser._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${searchedUser.username}`} />
                          <AvatarFallback>{searchedUser.username[0]}</AvatarFallback>
                        </Avatar>
                        <span>{searchedUser.username}</span>
                      </div>
                      <Tooltip content={user?.following.includes(searchedUser._id) ? 'Unfollow' : 'Follow'}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFollow(searchedUser._id)}
                        >
                          {user?.following.includes(searchedUser._id) ? 'Unfollow' : 'Follow'}
                        </Button>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2 h-5 w-5" />
                Friend Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {friendSuggestions.map((suggestion) => (
                  <div key={suggestion._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${suggestion.username}`} />
                        <AvatarFallback>{suggestion.username[0]}</AvatarFallback>
                      </Avatar>
                      <span>{suggestion.username}</span>
                    </div>
                    <Tooltip content="Follow user">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFollow(suggestion._id)}
                      >
                        Follow
                      </Button>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {notifications.map((notification, index) => (
        <div
          key={index}
          className={`fixed bottom-4 right-4 p-4 rounded-md bg-primary text-primary-foreground animate-in slide-in-from-bottom-5`}
        >
          {notification}
        </div>
      ))}
    </div>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background font-sans antialiased">{children}</div>
}