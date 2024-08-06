'use client'
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ToolInvocation } from 'ai';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { aiMode, explainMode } from "@/types";
import { DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useChat } from "ai/react";
import { Bot, Mic, MicOff, Moon, Sun, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const messagesContainer = useRef<HTMLDivElement>(null)
  const [chatId, setChatId] = useState<number | undefined>(undefined);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<string>('chat');
  const recognition = useRef<SpeechRecognition | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [clues, setClues] = useState<any[]>([]);
  const { setTheme } = useTheme();
  const [apiKey, setApiKey] = useState<string>('')
  const [mode, setMode] = useState<aiMode>(aiMode.obsessed);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    id: chatId?.toString(),
    api: 'api/chat',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'mode': mode,
    },
    onFinish: (message) => {
      const newClues = message.content.split('JSON:')[1];
      if (newClues) {
        const parsedClues = JSON.parse(newClues).clues;
        setClues((clues) => [...clues, ...parsedClues]);
      }

    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.SpeechRecognition || (window as any).webkitSpeechRecognition) {
        recognition.current = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
        recognition.current.interimResults = true;

        recognition.current.onresult = (event) => {
          if (inputRef.current) {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            inputRef.current.value = text;
            handleInputChange({ target: { value: text } } as any);
            setRecording(false);
          }
        };

        recognition.current.onerror = (event) => {
          console.log(event.error);
          setRecording(false);
        };
      } else {
        console.error('SpeechRecognition API not supported in this browser.');
      }
    }
  }, [handleInputChange]);

  const startRecognition = () => {
    if (recognition.current) {
      try {
        recognition.current.start();
        setRecording(true);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const stopRecognition = () => {
    if (recognition.current) {
      try {
        recognition.current.stop();
        setRecording(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem('apiKey')?.length === 56) {
      setApiKey(localStorage.getItem('apiKey') as string);
    }
  }, []);

  useEffect(() => {
    if (apiKey?.length === 56) {
      localStorage.setItem('apiKey', apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    if (messagesContainer.current) {
      messagesContainer.current.scrollTop = messagesContainer.current.scrollHeight;
    }
  }, [messages]);

  const changeMode = (mode: aiMode) => {
    setMode(mode);
    setTab('chat');
    handleReset();
  }

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handleReset = () => {
    setChatId(chatId => (chatId ?? 0) + 1);
    sessionStorage.setItem('clues', JSON.stringify([]));
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center align-middle min-h-screen">
        <div className="flex align-middle items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="w-[6rem] h-[3rem]">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog>
            <DialogTrigger asChild>
              <Button className={apiKey?.length === 56 ? '' : 'bg-destructive hover:bg-destructive'}>Api key</Button>
            </DialogTrigger>
            <DialogContent>
              <div className="flex items-center justify-center w-full h-full flex-col">
                <DialogHeader>
                  <DialogTitle>Enter your groq API key</DialogTitle>
                </DialogHeader>
                <Input type="text" placeholder="Enter your groq API key" onChange={(e) => setApiKey(e.target.value)} className="w-3/4 my-4" />
                <DialogClose asChild className="w-3/4">
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
          <Select defaultValue={aiMode.obsessed} onValueChange={(value) => changeMode(value as aiMode)} value={mode}>
            <SelectTrigger>
              <SelectValue placeholder="Select AI mode"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.values(aiMode).map((modeValue) => (
                <SelectItem key={modeValue} value={modeValue}>
                  {modeValue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {messages.length > 0 && (<Button onClick={() => handleReset()}
          >Clear messages</Button>)}
        </div>
        <h1 className="text-6xl font-bold py-4 md:text-5xl">Welcome to {mode} llama</h1>
        <Tabs className="flex items-center flex-col justify-center w-full gap-4 " value={tab} onValueChange={(value) => setTab(value)}>
          {mode === aiMode.detective && (
            <TabsList>
              <>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="clues">Clues</TabsTrigger>
              </>
            </TabsList>
          )}
          <TabsContent value="chat" className="bg-muted h-[60dvh] rounded-lg p-4 sm:w-11/12 lg:w-10/12 2xl:w-6/12 dark:bg-secondary bg-slate-300 ">
            <div className="h-full grid grid-rows-[6fr_1fr] rounded-lg w-full" >
              <div className="overflow-auto h-full" ref={messagesContainer}>
                {messages.length === 0 && (
                  <div className="w-full h-full flex justify-center items-center">
                    <Card className="text-xl h-1/2 w-1/2">
                      <CardContent className="flex flex-col justify-center items-center w-full h-full text-center">
                        {explainMode[mode]}
                      </CardContent>
                    </Card>
                  </div>)}
                {messages.map(message => (
                  <div key={message.id} className={`rounded-lg my-4 p-2 ${message.role === 'user' ? 'dark:bg-gray-950 bg-gray-500 ml-16' : 'dark:bg-gray-900 bg-gray-400 mr-16'}`}>
                    {message.role === 'user' ? <User className="flex" /> : <Bot />} <p dangerouslySetInnerHTML={{ __html: message.content.split('JSON:')[0] }} />
                  </div>
                ))}
              </div>
              <div className="flex align-middle items-center">
                {apiKey?.length === 56 ? (
                  <>
                    <form onSubmit={handleSubmit} className="w-full flex align-middle items-center">
                      <Textarea placeholder="Enter your message" className="mr-4" name="prompt" value={input} onChange={handleInputChange} id="input" onKeyDown={handleKeyDown} ref={inputRef} />
                      <Button type="submit">Send</Button>
                    </form>
                    {recording ? (
                      <Button onClick={stopRecognition}><MicOff /></Button>
                    ) : (
                      <Button onClick={startRecognition}><Mic /></Button>
                    )}
                  </>
                ) : (<p className="text-xl w-full text-center">Please enter your apiKey</p>)}
              </div>
            </div>
          </TabsContent>
          {mode === aiMode.detective && (
            <TabsContent value="clues" className="bg-muted h-[60dvh] rounded-lg p-4 sm:w-11/12 lg:w-10/12 2xl:w-6/12 dark:bg-secondary bg-slate-300 ">
              <div className="flex flex-wrap gap-4 items-center justify-center overflow-y-auto overflow-x-hidden w-full h-full">
                {clues.map((clue) => (
                  <div key={clue.id} className="rounded-lg my-4 p-2 bg-slate-300 text-black sm:w-full lg:w-5/12 2xl:w-3/12 overflow-y-auto h-[20dvh]">
                    <p>Pista {clue.id} <br />{clue.description}</p>
                  </div>))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div >
    </>
  );
}
