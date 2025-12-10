"use client"
import { IoMenu } from "react-icons/io5"

const Aside = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[60px] hidden md:block border-r border-gray-200 p-2 z-20">
      <button className=" bg-black p-2 rounded-full text-white">
        <IoMenu className="w-6 h-6" />
      </button>
    </aside>
  )
}

export default Aside
