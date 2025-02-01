import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function useRedirect(check:boolean) {
    useEffect(()=>{
          if(localStorage.getItem("token")){
            if(check){
              redirect('/draw');
            }
          }
          else{
            redirect('/auth');
          }
    },[])
}