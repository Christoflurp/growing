interface GettingStartedModalProps {
  show: boolean;
  userName: string;
  onClose: () => void;
}

export function GettingStartedModal({ show, userName, onClose }: GettingStartedModalProps) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content getting-started-modal" onClick={(e) => e.stopPropagation()}>
        <div className="getting-started-header">
          <span className="getting-started-icon">🌱</span>
          <h2>Welcome, {userName}!</h2>
        </div>

        <div className="getting-started-content">
          <p className="getting-started-intro">
            Here's a quick overview to help you get started:
          </p>

          <div className="getting-started-tips">
            <div className="tip">
              <span className="tip-icon">📋</span>
              <div className="tip-content">
                <strong>Tasks</strong>
                <span>Add daily tasks and link them to your goals. Incomplete tasks can be carried forward or deferred to your backlog.</span>
              </div>
            </div>

            <div className="tip">
              <span className="tip-icon">🎯</span>
              <div className="tip-content">
                <strong>Goals</strong>
                <span>Set goals organized by timeframe. Track progress through completed tasks or manual checkboxes.</span>
              </div>
            </div>

            <div className="tip">
              <span className="tip-icon">📝</span>
              <div className="tip-content">
                <strong>Notes</strong>
                <span>Capture quick thoughts anytime with the + button in the nav bar.</span>
              </div>
            </div>

            <div className="tip">
              <span className="tip-icon">⭐</span>
              <div className="tip-content">
                <strong>Brag Doc</strong>
                <span>Document your wins and accomplishments. Great for performance reviews!</span>
              </div>
            </div>
          </div>

          <p className="getting-started-footer">
            We've added some example goals to get you started. Feel free to edit or delete them.
          </p>
        </div>

        <button className="getting-started-btn" onClick={onClose}>
          Let's Go!
        </button>
      </div>
    </div>
  );
}
