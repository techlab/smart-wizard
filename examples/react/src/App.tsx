import { useRef, useState } from 'react';
import { useSmartWizard } from '@smartwizard/react';
import './App.css';

function App() {
    const wizardRef = useRef<HTMLDivElement>(null);
    const [transitionType, setTransitionType] = useState('slideHorizontal');

    const { stepInfo, next, prev, reset, wizard } = useSmartWizard(wizardRef, {
        transition: {
            animation: transitionType as any,
            speed: '400'
        },
        toolbar: {
            position: 'bottom'
        }
    });

    const handleTransitionChange = (type: string) => {
        setTransitionType(type);
        wizard?.setOptions({
            transition: {
                animation: type as any,
                speed: '400'
            }
        });
    };

    return (
        <div className="app">
            <div className="container">
                <h1>🚀 SmartWizard React Example</h1>
                <p className="subtitle">Built with React hooks and TypeScript</p>

                <div className="info-card">
                    <p><strong>Current Step:</strong> {stepInfo.currentStep + 1} of {stepInfo.totalSteps}</p>
                    <p><strong>Transition:</strong> {transitionType}</p>
                </div>

                <div className="transition-selector">
                    {['none', 'fade', 'slideHorizontal', 'slideVertical'].map(type => (
                        <button
                            key={type}
                            className={`transition-btn ${transitionType === type ? 'active' : ''}`}
                            onClick={() => handleTransitionChange(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div ref={wizardRef} id="smartwizard">
                    <ul className="nav">
                        <li className="nav-item">
                            <a className="nav-link" href="#step-1">
                                <span className="num">1</span>
                                <span>React</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#step-2">
                                <span className="num">2</span>
                                <span>Hooks</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#step-3">
                                <span className="num">3</span>
                                <span>TypeScript</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#step-4">
                                <span className="num">4</span>
                                <span>Done</span>
                            </a>
                        </li>
                    </ul>

                    <div className="tab-content">
                        <div id="step-1" className="tab-pane">
                            <h3>Welcome to React Integration!</h3>
                            <p>SmartWizard integrates seamlessly with React using hooks.</p>
                            <ul className="feature-list">
                                <li>useSmartWizard hook for easy integration</li>
                                <li>Ref-based initialization</li>
                                <li>Reactive state updates</li>
                                <li>TypeScript support</li>
                            </ul>
                        </div>
                        <div id="step-2" className="tab-pane">
                            <h3>React Hooks Pattern</h3>
                            <p>The useSmartWizard hook provides a clean API:</p>
                            <pre className="code-block">
                                {`const { stepInfo, next, prev, wizard } = 
  useSmartWizard(wizardRef, options);`}
                            </pre>
                            <p>All wizard methods are available through the hook return value.</p>
                        </div>
                        <div id="step-3" className="tab-pane">
                            <h3>Full TypeScript Support</h3>
                            <p>Enjoy complete type safety with TypeScript:</p>
                            <ul className="feature-list">
                                <li>Typed options and configuration</li>
                                <li>IntelliSense support</li>
                                <li>Compile-time error checking</li>
                                <li>Auto-completion for all methods</li>
                            </ul>
                        </div>
                        <div id="step-4" className="tab-pane">
                            <h3>Ready to Build!</h3>
                            <p>You're all set to use SmartWizard in your React application.</p>
                            <div className="action-buttons">
                                <button className="btn-secondary" onClick={reset}>
                                    Reset Wizard
                                </button>
                                <button className="btn-primary" onClick={() => alert('Wizard completed!')}>
                                    Complete
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="progress">
                        <div className="progress-bar" style={{ width: `${((stepInfo.currentStep + 1) / stepInfo.totalSteps) * 100}%` }}></div>
                    </div>
                </div>

                <div className="external-controls">
                    <h3>External Controls</h3>
                    <div className="button-group">
                        <button onClick={prev} disabled={stepInfo.currentStep === 0}>
                            ← Previous
                        </button>
                        <button onClick={next} disabled={stepInfo.currentStep === stepInfo.totalSteps - 1}>
                            Next →
                        </button>
                        <button onClick={reset}>
                            🔄 Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
