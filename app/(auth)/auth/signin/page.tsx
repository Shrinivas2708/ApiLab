"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from 'next-auth/react'
import { redirect } from 'next/navigation'
import React, { useState } from 'react'

function Sigin() {

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
 async  function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    if(!email) {
      setError("Email is required")
      return
    }
    if(!password){
      setError("Password is required")
      return
    }
    const res = await signIn("credentials",{
      email,
      password,
      redirect:false
    })
    if(res?.error){
      
      setError(res.error);
      return;
    }
    redirect("/")
  }
  return (
    <div className='w-md  border rounded-xl p-5 flex flex-col gap-3'>
      <div className='space-y-2'>
        <p className='text-center text-2xl '>
        Sigin
      </p>
      <p className='text-xs text-muted-foreground text-center'>
        Use your email and password to get logged in
      </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className='flex flex-col gap-5'>
       <div className='flex flex-col gap-2'>
         <Label htmlFor='email'>
          Email Address
        </Label>
        <Input placeholder='Enter email' type='email' id='email' onChange={(e)=> setEmail(e.target.value)}/>
       </div>
       <div className='flex flex-col gap-2'>
         <Label htmlFor='password'>
          Password
        </Label>
        <Input placeholder='**********' type='password' id='password' onChange={(e)=> setPassword(e.target.value)}/>
       </div>
       {error && <p className='text-xs text-red-500 text-center'>{error}</p>}
       <Button variant={"default"} type='submit'>
        Sign in
       </Button>
      </div>
      </form>
    </div>
  )
}

export default Sigin