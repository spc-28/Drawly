
export default function Bar({children, classname, onClick}:{classname?:string, children?:any, onClick?:()=>void}) {
    return(
        <div onClick={onClick} className={`bg-[#1C726D] h-[3.5rem] flex items-center border-0 rounded-2xl ${classname}`}>
            {children}
        </div>
    )
}