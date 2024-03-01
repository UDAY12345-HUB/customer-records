import React from 'react';
import { Link } from 'react-scroll';
import './Nav.css'


export default function Nav() {
  return (
    <>
    <div class="home-container">

        <nav>
            <i className="fa-regular fa-futbol"></i>
            <ul>
                <li className="active">Home</li>
                <li>Services</li>
                <li>Search</li>
                <li>About</li>
                <li>Profile
                    <span><i className="fa-solid fa-user"></i></span>
                </li>
            </ul>
        </nav>
      </div>

    </>

  );
};
