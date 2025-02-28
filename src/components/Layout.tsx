import React, { ReactNode } from 'react';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className={styles.main}>
      {children}
    </main>
  );
};

export default Layout;