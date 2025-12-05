"use client";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";
import { CloudCheck, LogIn, LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

function Navbar() {
  const { data: session } = useSession();

  return (
    <div className='w-full flex justify-between py-1 px-5 items-center border-b bg-background'>
        <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-primary">ApiLab</span>
        </h1>
       <div className="flex gap-3 items-center">
         <ModeToggle />
         
         {session ? (
            <>
                <Button variant={"outline"} className="hidden md:flex gap-2">
                    <CloudCheck size={16} /> Save Workspace
                </Button>
                <div className="flex items-center gap-2 ml-2">
                    <div className="text-sm text-right hidden sm:block">
                        <p className="font-medium leading-none">{session.user?.name}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => signOut()}>
                        <LogOut size={18} />
                    </Button>
                </div>
            </>
         ) : (
            <Button onClick={() => signIn()} className="gap-2">
                <LogIn size={16}/> Login
            </Button>
         )}
       </div>
    </div>
  )
}

export default Navbar