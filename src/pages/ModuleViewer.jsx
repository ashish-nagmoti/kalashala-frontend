import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

function ModuleViewer() {
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [nextModule, setNextModule] = useState(null);
  const [previousModule, setPreviousModule] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [pdfPage, setPdfPage] = useState(1);
  const [totalPdfPages, setTotalPdfPages] = useState(0);
  const [showControls, setShowControls] = useState(false);

  // State variables for enhanced features
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkPosition, setBookmarkPosition] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showNotes, setShowNotes] = useState(false);

  const videoRef = useRef(null);
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [progressData, setProgressData] = useState({
    timeSpent: 0,
    lastPosition: 0,
    completed: false,
  });

  const [timer, setTimer] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgressData((prev) => ({
        ...prev,
        timeSpent: prev.timeSpent + 1,
      }));
    }, 1000);

    setTimer(interval);

    return () => {
      clearInterval(interval);
      if (module && !completed) {
        saveProgress();
      }
    };
  }, [module]);

  const saveProgress = async () => {
    if (!module) return;

    try {
      let currentPosition = 0;
      if (module.content_type === 'video' && videoRef.current) {
        currentPosition = videoRef.current.currentTime;
      } else if (module.content_type === 'pdf') {
        currentPosition = pdfPage;
      }

      await fetch(`http://localhost:8000/blog/module/${moduleId}/progress/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          position: currentPosition,
          time_spent: progressData.timeSpent,
        }),
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  useEffect(() => {
    if (progressData.timeSpent > 0 && progressData.timeSpent % 30 === 0) {
      saveProgress();
    }
  }, [progressData.timeSpent]);

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/blog/module/${moduleId}/`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch module: ${response.status}`);
        }

        const data = await response.json();
        setModule(data);

        try {
          const progressResponse = await fetch(`http://localhost:8000/blog/module/${moduleId}/progress/`, {
            credentials: 'include',
          });

          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            setCompleted(progressData.completed);

            if (progressData.position) {
              setProgressData((prev) => ({
                ...prev,
                lastPosition: progressData.position,
              }));
            }
          }
        } catch (progressErr) {
          console.log('Progress data not available or user not logged in');
        }

        try {
          const navigationResponse = await fetch(`http://localhost:8000/blog/module/${moduleId}/navigation/`, {
            credentials: 'include',
          });

          if (navigationResponse.ok) {
            const navData = await navigationResponse.json();
            setNextModule(navData.next_module);
            setPreviousModule(navData.previous_module);
          }
        } catch (navErr) {
          console.log('Navigation data not available');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching module details:', err);
        setError('Failed to load module content. Please try again later.');
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchModuleDetails();
    }
  }, [moduleId]);

  useEffect(() => {
    if (module?.content_type === 'video' && videoRef.current && progressData.lastPosition > 0) {
      videoRef.current.currentTime = progressData.lastPosition;
    }
  }, [videoRef.current, module]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleMarkComplete = async () => {
    try {
      await fetch(`http://localhost:8000/blog/module/${moduleId}/complete/`, {
        method: 'POST',
        credentials: 'include',
      });
      setCompleted(true);
    } catch (err) {
      console.error('Error marking module as complete:', err);
    }
  };

  const navigateToModule = (id) => {
    if (id) {
      navigate(`/module-viewer/${id}`);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);

      if (progress > 95 && !completed) {
        handleMarkComplete();
      }
    }
  };

  const handlePdfPageChange = (page) => {
    setPdfPage(page);

    if (page === totalPdfPages && !completed) {
      handleMarkComplete();
    }

    setProgressData((prev) => ({
      ...prev,
      lastPosition: page,
    }));
  };

  const handlePdfLoad = ({ numPages }) => {
    setTotalPdfPages(numPages);
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const saveNote = async () => {
    if (!notes.trim()) return;

    try {
      let currentPosition = 0;
      let positionType = 'time';

      if (module.content_type === 'video' && videoRef.current) {
        currentPosition = videoRef.current.currentTime;
      } else if (module.content_type === 'pdf') {
        currentPosition = pdfPage;
        positionType = 'page';
      }

      const newNote = {
        id: Date.now(),
        content: notes,
        timestamp: new Date().toISOString(),
        position: currentPosition,
        positionType,
      };

      const updatedNotes = [...savedNotes, newNote];
      setSavedNotes(updatedNotes);

      await fetch(`http://localhost:8000/blog/module/${moduleId}/notes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: notes,
          position: currentPosition,
          position_type: positionType,
        }),
      });

      setNotes('');
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const updatedNotes = savedNotes.filter((note) => note.id !== noteId);
      setSavedNotes(updatedNotes);

      await fetch(`http://localhost:8000/blog/module/${moduleId}/notes/${noteId}/`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const toggleBookmark = async () => {
    try {
      let currentPosition = 0;

      if (module.content_type === 'video' && videoRef.current) {
        currentPosition = videoRef.current.currentTime;
      } else if (module.content_type === 'pdf') {
        currentPosition = pdfPage;
      }

      if (isBookmarked) {
        await fetch(`http://localhost:8000/blog/module/${moduleId}/bookmark/`, {
          method: 'DELETE',
          credentials: 'include',
        });
        setIsBookmarked(false);
      } else {
        await fetch(`http://localhost:8000/blog/module/${moduleId}/bookmark/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            position: currentPosition,
          }),
        });
        setIsBookmarked(true);
        setBookmarkPosition(currentPosition);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const goToBookmark = () => {
    if (!isBookmarked) return;

    if (module.content_type === 'video' && videoRef.current) {
      videoRef.current.currentTime = bookmarkPosition;
    } else if (module.content_type === 'pdf') {
      setPdfPage(bookmarkPosition);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleOutline = () => {
    setShowOutline(!showOutline);
  };

  const changePlaybackSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`http://localhost:8000/blog/module/${moduleId}/notes/`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setSavedNotes(
            data.map((note) => ({
              ...note,
              id: note.id,
              positionType: note.position_type,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch notes:', err);
      }
    };

    const fetchBookmark = async () => {
      try {
        const response = await fetch(`http://localhost:8000/blog/module/${moduleId}/bookmark/`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.position) {
            setIsBookmarked(true);
            setBookmarkPosition(data.position);
          }
        }
      } catch (err) {
        console.error('Failed to fetch bookmark:', err);
        setIsBookmarked(false);
      }
    };

    if (moduleId) {
      fetchNotes();
      fetchBookmark();
    }
  }, [moduleId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        <button
          onClick={handleGoBack}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Module not found</h2>
          <button
            onClick={handleGoBack}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'bg-gray-900 text-white' : ''}`}>
      {/* Top control bar */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={handleGoBack}
            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'} font-bold py-2 px-4 rounded inline-flex items-center mr-2`}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back
          </button>
          
          {/* Bookmark button */}
          <button
            onClick={toggleBookmark}
            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-bold py-2 px-3 rounded inline-flex items-center mr-2`}
            title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <svg
              className={`w-5 h-5 ${isBookmarked ? 'text-yellow-500' : darkMode ? 'text-gray-300' : 'text-gray-600'}`}
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
            </svg>
          </button>
          
          {/* Go to bookmark button (only if bookmark exists) */}
          {isBookmarked && (
            <button
              onClick={goToBookmark}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-bold py-2 px-3 rounded inline-flex items-center mr-2`}
              title="Go to bookmark"
            >
              <svg
                className="w-5 h-5 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
              </svg>
            </button>
          )}
          
          {/* Toggle notes button */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-bold py-2 px-3 rounded inline-flex items-center mr-2 ${showNotes ? (darkMode ? 'bg-blue-700' : 'bg-blue-200') : ''}`}
            title="Toggle notes panel"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          
          {/* Toggle outline button */}
          <button
            onClick={toggleOutline}
            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-bold py-2 px-3 rounded inline-flex items-center mr-2 ${showOutline ? (darkMode ? 'bg-blue-700' : 'bg-blue-200') : ''}`}
            title="Toggle module outline"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
            </svg>
          </button>
        </div>
        
        <div className="flex items-center">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-bold py-2 px-3 rounded inline-flex items-center mr-2`}
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {darkMode ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              )}
            </svg>
          </button>
          
          {!completed && (
            <button
              onClick={handleMarkComplete}
              className={`${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white font-bold py-2 px-4 rounded inline-flex items-center`}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Mark as Complete
            </button>
          )}

          {completed && (
            <div className={`${darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-700'} py-2 px-4 rounded inline-flex items-center`}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Completed
            </div>
          )}
        </div>
      </div>

      {/* Flexbox layout for main content and sidebar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Module outline sidebar (conditionally rendered) */}
        {showOutline && (
          <div className={`w-full md:w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden mb-4 md:mb-0 md:sticky md:top-4 md:self-start`}>
            <div className={`px-4 py-3 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-b ${darkMode ? 'border-gray-600' : 'border-blue-100'}`}>
              <h3 className="font-bold">Module Outline</h3>
            </div>
            <div className="p-4">
              {module.sections && module.sections.length > 0 ? (
                <ul className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {module.sections.map((section, index) => (
                    <li key={index} className="mb-3">
                      <div className="flex items-start">
                        <div className={`rounded-full ${darkMode ? 'bg-gray-700' : 'bg-blue-100'} ${section.completed ? (darkMode ? 'text-green-400' : 'text-green-500') : (darkMode ? 'text-gray-400' : 'text-gray-500')} w-6 h-6 flex items-center justify-center mr-2 mt-0.5`}>
                          <span className="text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{section.title}</p>
                          {section.duration && (
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {section.duration} minutes
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No outline available for this module.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
          {module.thumbnail && (
            <div className="relative h-48 md:h-64 overflow-hidden">
              <img src={module.thumbnail} alt={module.title} className="w-full h-full object-cover" />
              {completed && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
            </div>
          )}

          <div className="p-6">
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{module.title}</h1>

            <div className={`flex flex-wrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              {module.duration && (
                <div className="mr-4">
                  <span className="mr-1">Duration:</span>
                  <span>{module.duration} minutes</span>
                </div>
              )}

              {module.content_type && (
                <div className="mr-4">
                  <span className="mr-1">Type:</span>
                  <span className="capitalize">{module.content_type}</span>
                </div>
              )}
            </div>

            {module.content_type === 'video' && (
              <div className="mb-4">
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${videoProgress}%` }}
                  ></div>
                </div>
                <div className={`flex justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  <span>Progress: {Math.round(videoProgress)}%</span>
                  <span>
                    Time spent: {Math.floor(progressData.timeSpent / 60)}:
                    {String(progressData.timeSpent % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}

            {module.content_type === 'pdf' && totalPdfPages > 0 && (
              <div className="mb-4">
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${(pdfPage / totalPdfPages) * 100}%` }}
                  ></div>
                </div>
                <div className={`flex justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  <span>
                    Page {pdfPage} of {totalPdfPages}
                  </span>
                  <span>
                    Time spent: {Math.floor(progressData.timeSpent / 60)}:
                    {String(progressData.timeSpent % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}

            <div className={`prose max-w-none mb-6 ${darkMode ? 'text-gray-300 prose-headings:text-gray-100 prose-a:text-blue-400' : ''}`}>
              <p>{module.description}</p>
            </div>

            <div className="mt-8">
              {module.content_type === 'video' && (
                <div>
                  <div
                    className="aspect-w-16 aspect-h-9 relative"
                    onMouseEnter={() => setShowControls(true)}
                    onMouseLeave={() => setShowControls(false)}
                  >
                    {module.video_url ? (
                      <iframe
                        src={module.video_url}
                        title={module.title}
                        className="w-full h-full rounded"
                        allowFullScreen
                      ></iframe>
                    ) : module.video_file ? (
                      <div>
                        <video
                          ref={videoRef}
                          controls
                          className="w-full rounded"
                          src={module.video_file}
                          controlsList="nodownload"
                          onTimeUpdate={handleTimeUpdate}
                          onEnded={() => !completed && handleMarkComplete()}
                        >
                          Your browser does not support the video tag.
                        </video>
                        
                        {/* Video playback speed controls */}
                        <div className={`mt-2 p-2 rounded flex justify-center gap-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <span className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Speed:</span>
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                            <button
                              key={speed}
                              onClick={() => changePlaybackSpeed(speed)}
                              className={`px-2 py-1 rounded text-sm 
                                ${playbackSpeed === speed 
                                  ? (darkMode ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white') 
                                  : (darkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                                }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center h-64 rounded`}>
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Video not available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {module.content_type === 'blog' && (
                <div className={`prose max-w-none ${darkMode ? 'prose-invert' : ''}`}>
                  {module.blog_content || module.text_content ? (
                    <div dangerouslySetInnerHTML={{ __html: module.blog_content || module.text_content }} />
                  ) : (
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Blog content not available</p>
                  )}
                </div>
              )}

              {module.content_type === 'pdf' && (
                <div className="mt-4">
                  {module.document_file ? (
                    <div>
                      <a
                        href={module.document_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded inline-flex items-center`}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          ></path>
                        </svg>
                        Download PDF
                      </a>

                      <div className={`mt-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded`}>
                        <object
                          data={`${module.document_file}#view=fitH`}
                          type="application/pdf"
                          className="w-full h-screen"
                        >
                          <div className={`flex flex-col items-center justify-center p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}>
                            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Unable to display PDF directly in the browser.
                            </p>
                            <a
                              href={module.document_file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded inline-flex items-center`}
                            >
                              Open PDF
                            </a>
                          </div>
                        </object>
                      </div>
                    </div>
                  ) : (
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Document not available</p>
                  )}
                </div>
              )}
            </div>

            <div className={`mt-10 flex justify-between ${darkMode ? 'border-t border-gray-700 pt-5' : 'border-t border-gray-200 pt-5'}`}>
              <button
                onClick={() => navigateToModule(previousModule?.id)}
                className={`px-4 py-2 rounded flex items-center ${
                  previousModule
                    ? (darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')
                    : (darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-500') + ' cursor-not-allowed'
                }`}
                disabled={!previousModule}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Previous Module
              </button>

              {!completed && (
                <button
                  onClick={handleMarkComplete}
                  className={`${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white font-bold py-2 px-4 rounded inline-flex items-center mx-2`}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Mark as Complete
                </button>
              )}

              <button
                onClick={() => navigateToModule(nextModule?.id)}
                className={`px-4 py-2 rounded flex items-center ${
                  nextModule
                    ? (darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')
                    : (darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-500') + ' cursor-not-allowed'
                }`}
                disabled={!nextModule}
              >
                Next Module
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Notes sidebar (conditionally rendered) */}
        {showNotes && (
          <div className={`w-full md:w-72 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden mb-4 md:mb-0 md:sticky md:top-4 md:self-start`}>
            <div className={`px-4 py-3 ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'} border-b ${darkMode ? 'border-gray-600' : 'border-yellow-100'}`}>
              <h3 className="font-bold">My Notes</h3>
            </div>
            <div className="p-4">
              {/* Note input area */}
              <div className={`mb-4 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <textarea
                  value={notes}
                  onChange={handleNotesChange}
                  className={`w-full p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  rows="4"
                  placeholder="Add notes here..."
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={saveNote}
                    className={`${notes.trim() ? (darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600') : (darkMode ? 'bg-gray-700' : 'bg-gray-300')} text-white px-3 py-1 rounded`}
                    disabled={!notes.trim()}
                  >
                    Save Note
                  </button>
                </div>
              </div>
              
              {/* List of saved notes */}
              <div className={`space-y-4 max-h-96 overflow-y-auto ${darkMode ? 'scrollbar-dark' : ''}`}>
                {savedNotes.length > 0 ? (
                  savedNotes.map((note) => (
                    <div 
                      key={note.id} 
                      className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'} relative`}
                    >
                      <p className={`text-sm mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{note.content}</p>
                      <div className={`text-xs flex justify-between ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span>
                          {note.positionType === 'time' 
                            ? `At ${Math.floor(note.position / 60)}:${String(Math.floor(note.position % 60)).padStart(2, '0')}`
                            : `Page ${note.position}`
                          }
                        </span>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete note"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No notes yet. Add your first note above!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModuleViewer;