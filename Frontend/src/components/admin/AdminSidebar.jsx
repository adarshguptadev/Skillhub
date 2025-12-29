import { useContext } from "react";
import { AdminDataContext } from "../../context/Admincontext";
import { useState } from "react"
import { User, BookOpenCheck, MapPinned, Brain, Youtube, ChevronRight, X, Menu, LogOut, Users } from "lucide-react"
import { useLocation } from "react-router-dom"
import { Link } from "react-router-dom";


const navigationItems = [
  {
    title: "Profile",
    url: "/admin",
    icon: User,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Roadmaps",
    url: "/admin/roadmaps",
    icon: MapPinned,
  },
  {
    title: "Lessons",
    url: "/admin/explore-lessons",
    icon: BookOpenCheck,
  },
  {
    title: "Tutorials",
    url: "/admin/tutorials",
    icon: Youtube,
  },
  {
    title: "Quizzes",
    url: "/admin/quizzes",
    icon: Brain,
  },
  {
    title: "Logout",
    url: "/admin/logout",
    icon: LogOut,
  },
]

const AdminSidebar = () => {

  const { admin } = useContext(AdminDataContext);

  const location = useLocation()
  const currentPage = location.pathname
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-sm bg-white shadow-lg hover:bg-gray-100 transition-colors border border-gray-200"
        style={{ backgroundColor: "#ffffff" }}
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        />
      )}

      <div
        className={`
          fixed lg:static top-0 left-0 h-full lg:h-screen w-65 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none
          flex flex-col z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          backgroundColor: "#ffffff",
          height: "100vh",
          minHeight: "100vh",
        }}
      >

        <div className="flex items-center justify-between p-4 border-b border-gray-300 flex-shrink-0">
          <Link to='/admin' className="flex items-center h-[31px] gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm  text-white">
              <img
                className="mx-auto h-10 w-auto"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1U9JgypRbCtg0hoBbAaZMy6Tf0ZA3X-Gtjw&s"
                alt="Company Logo"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">Skillhub</span>
            </div>
          </Link>

          <button onClick={toggleSidebar} className="lg:hidden p-1 rounded-sm hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2 border-b pb-3 border-gray-300">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              const isCurrentPage = currentPage === item.url

              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors
                    ${isCurrentPage
                      ? "bg-gray-100 text-gray-900 border border-gray-300"
                      : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-[17px]">{item.title}</span>
                  {isCurrentPage && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="border-t  border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Link to='/admin' className="h-8 w-8  rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </Link>
            <Link to='/admin' className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{admin.name}</span>
              <span className="text-xs text-gray-500">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar
