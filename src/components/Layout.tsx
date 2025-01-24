import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    const token = localStorage.getItem('token');
    console.log('Token:', token); // Debugging line
    if (token) {
      setIsAuthenticated(true);
      console.log('User is authenticated'); // Debugging line
    } else {
      setIsAuthenticated(false);
      console.log('User is not authenticated'); // Debugging line
      // Redirect to login page if not authenticated
      if (router.pathname !== '/login' && router.pathname !== '/register') {
        router.push('/login');
      }
    }
  }, [router.pathname]);

  console.log('isAuthenticated:', isAuthenticated); // Debugging line

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className={styles.container}>
      <Navbar />
      {isAuthenticated && (
        <button className={styles.sidebarToggle} onClick={toggleSidebar}>
          &#9776; {/* Unicode character for the three-line menu icon */}
        </button>
      )}
      <div className={styles.content}>
        {isAuthenticated && isSidebarVisible && <Sidebar />}
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;