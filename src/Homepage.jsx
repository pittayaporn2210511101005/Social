import React from 'react'
import './Homepage.css'
 

function Homepage() {
  return (
    <div className='homepage-container'>
        {/*แถบซ้าย*/  }
        <div className='sidebar'>
        <div className='logo-container'>
        <img src='https://upload.wikimedia.org/wikipedia/th/f/f5/%E0%B8%95%E0%B8%A3%E0%B8%B2%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%A5%E0%B8%B1%E0%B8%A2%E0%B8%AB%E0%B8%AD%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%84%E0%B9%89%E0%B8%B2%E0%B9%84%E0%B8%97%E0%B8%A2.svg'
         width='100%'  ></img>
           <span className='logo-utcc'> UTCC </span>
           <span className='logo-social'> Social</span>
        </div>

        <nav className='nav-menu'>
            <div className='nav-item'>
                <i className='far fa-chart-line'></i>
                <span>Dashboard</span>
            </div>
        <div className='nav-item active'>
            <i className='fas fa-comment-dots'></i>
            <span>Mentions</span>
        </div>
        <div className='nav-item'>
            <i className='fas fa-smile'></i>
            <span>Sentiment</span>
        </div>
        <div className='nav-item'>
            <i className='fas fa-stream'></i>
            <span>Trends</span>
        </div>
        <div className='nav-item'>
            <i className='fas fa-cog'></i>
            <span>Settings</span>
        </div>
    </nav>
</div>

    {/*หน้าหลัก */}
    <div className='main-content'>
        <header className='main-header'>
        <div className='header-left'>
        <h1 className='header-title'>Mentions</h1>
        </div>
    <div className='header-right'>
        <div className='search-bar'>
            <i className='fas fa-search'></i>
            <input type="text" placeholder="Serch"/>
        </div>
    <div className='profile-icon'>
            <i className='fas fa-user-circle'></i>
    </div>
    </div>
    </header>

    {/*ส่วนเวจเจ็ท*/}
    <main className='widgets-grid'>
        <div className='widget-card widget-sentiment'>
            <h3 className='widget-title'>Sentiment Overview</h3>
            <div className='chart-placeholder'> ใส่วงกลมแนวโน้ม </div>
        </div>

        <div className="widget-card widget-mentions-trend">
            <h3 className="widget-title">Mention Trends</h3>
            <div className="chart-placeholder">กราฟขึ้นลง</div>
          </div>

          <div className="widget-card widget-hashtags">
            <h3 className="widget-title">Top Hashtags</h3>
            <div className="chart-placeholder">แฮทเท็คยอดนิยม</div>
          </div>

        {/*คำนวนออกมา */}
          <div className="widget-metrics">
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Total Mentions (การกล่าวถึงทั้งหมด)</span>
              </div>
              <div className="metric-content">
                <span className="metric-value">412สมมุติเฉยๆ</span>
                <div className="metric-graph"></div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Engagement Rate(อัตราการมีส่วนร่วม)</span>
              </div>
              <div className="metric-content">
                <span className="metric-value">37,80สมมิุตเฉยๆ</span>
                <div className="metric-graph"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Homepage;
   
