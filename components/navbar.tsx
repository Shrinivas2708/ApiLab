

import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";
import { CloudCheck } from "lucide-react";
function Navbar() {
  return (
    <div className='w-full flex justify-between py-3 px-5  items-center'>
        <h1 className="text-xl font-bold hover:text-white/70 hover:cursor-pointer">ApiLab</h1>
       <div className="flex gap-3">
         <ModeToggle/>
         <Button variant={"outline"}>
          <CloudCheck />  Save My Workspace
         </Button>
        <Button className="font-bold">
            Login
        </Button>

       </div>
    </div>
  )
}

export default Navbar