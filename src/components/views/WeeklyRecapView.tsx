import { useState } from "react";
import { useWeeklyRecap } from "../../hooks/useWeeklyRecap";
import { GrowthSignal, WeeklyRecapMeeting } from "../../types";

const NARRATIVE_TRUNCATE_LENGTH = 400;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toText(value: any): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (typeof value === "object") {
    return value.summary || value.text || value.topic || value.title || value.name || JSON.stringify(value);
  }
  return String(value);
}

const emptyGrowthSignal: GrowthSignal = { rating: "mixed", evidence: [], summary: "" };

function GrowthStamp({ label, signal }: { label: string; signal: GrowthSignal | undefined }) {
  const s = signal || emptyGrowthSignal;
  return (
    <div className={`nb-growth-card nb-rating-${s.rating}`}>
      <div className="nb-growth-card-header">
        <span className="nb-growth-label">{label}</span>
        <span className={`nb-stamp nb-stamp-${s.rating}`}>{s.rating}</span>
      </div>
      <ul className="nb-evidence-list">
        {(s.evidence || []).map((e, i) => (
          <li key={i}>{toText(e)}</li>
        ))}
      </ul>
      {s.summary && <p className="nb-growth-summary">{s.summary}</p>}
    </div>
  );
}

function SectionDivider() {
  return <div className="nb-divider"><span>***</span></div>;
}

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
  count,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div className={`nb-collapsible ${expanded ? "expanded" : ""}`}>
      <button className="nb-collapsible-toggle" onClick={onToggle}>
        <svg className="nb-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span>{title}</span>
        {count !== undefined && <span className="nb-collapsible-count">{count}</span>}
      </button>
      {expanded && <div className="nb-collapsible-content">{children}</div>}
    </div>
  );
}

function MeetingCategoryIcon({ category }: { category: string }) {
  const icons: Record<string, string> = {
    "1:1": "1:1",
    planning: "PLN",
    pairing: "PR",
    social: "SOC",
    other: "OTH",
  };
  return <span className={`nb-meeting-cat nb-cat-${category.replace(":", "")}`}>{icons[category] || category}</span>;
}

function formatHours(hours: number): string {
  if (!hours) return "0m";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function NarrativeBlock({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > NARRATIVE_TRUNCATE_LENGTH;
  const displayText = needsTruncation && !expanded
    ? text.slice(0, NARRATIVE_TRUNCATE_LENGTH).replace(/\s+\S*$/, "") + "\u2026"
    : text;

  return (
    <section className="nb-narrative">
      <p>{displayText}</p>
      {needsTruncation && (
        <button className="nb-narrative-toggle" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </section>
  );
}

export function WeeklyRecapView() {
  const {
    enabled,
    recapPath,
    recap,
    loading,
    error,
    expandedSections,
    goToPreviousWeek,
    goToNextWeek,
    toggleSection,
    hasPreviousWeek,
    hasNextWeek,
  } = useWeeklyRecap();

  if (!enabled) {
    return (
      <div className="view weekly-recap-view">
        <div className="nb-page">
          <div className="nb-empty-state">
            <div className="nb-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </div>
            <p className="nb-empty-title">Weekly Recap is disabled</p>
            <p className="nb-empty-desc">Enable it in Settings and select a folder containing recap JSON files.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!recapPath) {
    return (
      <div className="view weekly-recap-view">
        <div className="nb-page">
          <div className="nb-empty-state">
            <div className="nb-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="nb-empty-title">No folder selected</p>
            <p className="nb-empty-desc">Go to Settings to select a folder containing your weekly recap JSON files.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="view weekly-recap-view">
        <div className="nb-page">
          <div className="nb-empty-state">
            <div className="nb-loading-pulse" />
            <p className="nb-empty-desc">Loading field notes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view weekly-recap-view">
        <div className="nb-page">
          <div className="nb-empty-state">
            <p className="nb-empty-title">Error loading recap</p>
            <p className="nb-empty-desc nb-error-text">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!recap) {
    return (
      <div className="view weekly-recap-view">
        <div className="nb-page">
          <div className="nb-empty-state">
            <div className="nb-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </div>
            <p className="nb-empty-title">No recaps found</p>
            <p className="nb-empty-desc">No *-W*.json files found in the selected folder.</p>
          </div>
        </div>
      </div>
    );
  }

  const meta = recap.meta || {};
  const dateRange = meta.dateRange || {};
  const narrative = recap.narrative || "";
  const code = recap.code || {};
  const stats = code.stats || {};
  const prsShipped = code.prsShipped || [];
  const prsOpened = code.prsOpened || [];
  const stacks = code.stacks || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allOpenPRs = code.allOpenPRs || (code as any).openPRsOtherRepos || [];
  const slack = recap.slack || {};
  const slackProjects = slack.projects || [];
  const slackTechnical = slack.technical || [];
  const slackOperational = slack.operational || [];
  const slackProcess = slack.process || [];
  const slackNonWork = slack.nonWork || [];
  const slackDistractions = slack.distractions || [];
  const kudos = slack.kudos || { given: [], received: [] };
  const kudosGiven = kudos.given || [];
  const kudosReceived = kudos.received || [];
  const projects = recap.projects || {};
  const activeProjects = projects.active || [];
  const experiments = projects.experiments || [];
  const teamActivity = projects.teamActivity || [];
  const projectUpdates = projects.updates || [];
  const activity = recap.activity || {};
  const meetings = activity.meetings || [];
  const breakdown = activity.meetingBreakdown || { total: { hours: 0, count: 0 }, byCategory: [] };
  const breakdownTotal = breakdown.total || { hours: 0, count: 0 };
  const breakdownByCategory = breakdown.byCategory || [];
  const scratchNotes = recap.scratchNotes || [];
  const growth = recap.growth || {};

  const meetingsByDay: Record<string, WeeklyRecapMeeting[]> = {};
  for (const m of meetings) {
    const day = (m.time || "").split(" ")[0] || "Unknown";
    if (!meetingsByDay[day]) meetingsByDay[day] = [];
    meetingsByDay[day].push(m);
  }

  const collapsibleCodeCount = prsShipped.length + prsOpened.length + stacks.length + allOpenPRs.length;
  const collapsibleSlackCount = slackOperational.length + slackProcess.length + slackNonWork.length + slackDistractions.length;

  return (
    <div className="view weekly-recap-view">
      <div className="nb-page">

        {/* Header */}
        <header className="nb-header">
          <span className="nb-header-label">Weekly Review</span>
          <div className="nb-nav-row">
            <button className="nb-nav-btn" onClick={goToPreviousWeek} disabled={!hasPreviousWeek} title="Previous week">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div className="nb-week-info">
              <h1 className="nb-week-title">{dateRange.display || meta.week || ""}</h1>
            </div>
            <button className="nb-nav-btn" onClick={goToNextWeek} disabled={!hasNextWeek} title="Next week">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </header>

        <SectionDivider />

        {/* Narrative */}
        {narrative && <NarrativeBlock text={narrative} />}

        {narrative && <SectionDivider />}

        {/* Code / Field Count */}
        <section className="nb-section">
          <h2 className="nb-section-title">Field Count</h2>
          <div className="nb-tally-row">
            <div className="nb-tally">
              <span className="nb-tally-value">{stats.shipped || 0}</span>
              <span className="nb-tally-label">shipped</span>
            </div>
            <div className="nb-tally">
              <span className="nb-tally-value">{stats.opened || 0}</span>
              <span className="nb-tally-label">opened</span>
            </div>
            <div className="nb-tally">
              <span className="nb-tally-value">{stats.reviewed || 0}</span>
              <span className="nb-tally-label">reviewed</span>
            </div>
            <div className="nb-tally nb-tally-diff">
              <span className="nb-tally-value">
                <span className="nb-additions">+{(stats.totalAdditions || 0).toLocaleString()}</span>
                {" "}
                <span className="nb-deletions">-{(stats.totalDeletions || 0).toLocaleString()}</span>
              </span>
              <span className="nb-tally-label">diff</span>
            </div>
          </div>

          {collapsibleCodeCount > 0 && (
            <CollapsibleSection title="PRs & Stacks" expanded={expandedSections.code} onToggle={() => toggleSection("code")} count={collapsibleCodeCount}>
              {prsShipped.length > 0 && (
                <>
                  <h4 className="nb-subsection-title">Shipped</h4>
                  <ul className="nb-pr-list">
                    {prsShipped.map((pr) => (
                      <li key={pr.url}>
                        <a href={pr.url} target="_blank" rel="noopener noreferrer">
                          {pr.repo}#{pr.number}
                        </a>
                        <span className="nb-pr-title">{pr.title}</span>
                        <span className="nb-pr-diff">
                          <span className="nb-additions">+{pr.additions}</span>
                          <span className="nb-deletions">-{pr.deletions}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {prsOpened.length > 0 && (
                <>
                  <h4 className="nb-subsection-title">Opened</h4>
                  <ul className="nb-pr-list">
                    {prsOpened.map((pr) => (
                      <li key={pr.url}>
                        <a href={pr.url} target="_blank" rel="noopener noreferrer">
                          {pr.repo}#{pr.number}
                        </a>
                        <span className="nb-pr-title">{pr.title}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {stacks.length > 0 && (
                <>
                  <h4 className="nb-subsection-title">Stacks</h4>
                  <ul className="nb-pr-list">
                    {stacks.map((s) => (
                      <li key={s.rootBranch}>
                        <a href={s.prUrl} target="_blank" rel="noopener noreferrer">{s.rootBranch}</a>
                        <span className="nb-stack-depth">depth: {s.depth}</span>
                        {s.needsRestack && <span className="nb-needs-restack">needs restack</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {allOpenPRs.length > 0 && (
                <>
                  <h4 className="nb-subsection-title">Open PRs</h4>
                  <ul className="nb-pr-list">
                    {allOpenPRs.map((pr) => (
                      <li key={pr.url}>
                        <a href={pr.url} target="_blank" rel="noopener noreferrer">
                          {pr.repo}#{pr.number}
                        </a>
                        <span className="nb-pr-title">{pr.title}</span>
                        <span className={`nb-pr-state nb-state-${pr.state}`}>{pr.state}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CollapsibleSection>
          )}
        </section>

        <SectionDivider />

        {/* Projects / Active Work */}
        <section className="nb-section">
          <h2 className="nb-section-title">Active Work</h2>
          {activeProjects.length > 0 && (
            <div className="nb-project-cards">
              {activeProjects.map((p) => (
                <div key={p.name} className="nb-project-card">
                  <div className="nb-project-header">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="nb-project-name">{p.name}</a>
                    <span className={`nb-stamp nb-stamp-role-${(p.role || "contributor").toLowerCase()}`}>{p.role}</span>
                  </div>
                  <div className="nb-project-meta">
                    <span className="nb-project-phase">{p.phase}</span>
                    <span className="nb-project-status">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(experiments.length > 0 || teamActivity.length > 0 || projectUpdates.length > 0) && (
            <CollapsibleSection title="Experiments & Flags" expanded={expandedSections.projects} onToggle={() => toggleSection("projects")} count={experiments.length}>
              {experiments.length > 0 && (
                <ul className="nb-experiment-list">
                  {experiments.map((ex) => (
                    <li key={ex.handle}>
                      <a href={ex.url} target="_blank" rel="noopener noreferrer">{ex.handle}</a>
                      <span className={`nb-exp-type nb-type-${ex.type}`}>{ex.type}</span>
                      <span className="nb-exp-state">{ex.state}</span>
                      {ex.rollout !== null && <span className="nb-exp-rollout">{ex.rollout}%</span>}
                      {ex.notes && <span className="nb-exp-notes">{ex.notes}</span>}
                    </li>
                  ))}
                </ul>
              )}
              {teamActivity.length > 0 && (
                <>
                  <h4 className="nb-subsection-title">Team Activity</h4>
                  <ul className="nb-simple-list">
                    {teamActivity.map((a, i) => <li key={i}>{toText(a)}</li>)}
                  </ul>
                </>
              )}
              {projectUpdates.length > 0 && (
                <>
                  <h4 className="nb-subsection-title">Updates</h4>
                  <ul className="nb-simple-list">
                    {projectUpdates.map((u, i) => <li key={i}>{toText(u)}</li>)}
                  </ul>
                </>
              )}
            </CollapsibleSection>
          )}
        </section>

        <SectionDivider />

        {/* Slack / Conversations */}
        <section className="nb-section">
          <h2 className="nb-section-title">Conversations</h2>
          {slackProjects.map((sp) => (
            <div key={sp.name} className="nb-slack-project">
              <h3 className="nb-slack-project-name">{sp.name}</h3>
              <div className="nb-slack-meta">
                {(sp.channels || []).map((c, i) => <span key={i} className="nb-channel-tag">#{toText(c)}</span>)}
              </div>
              <ul className="nb-simple-list">
                {(sp.activities || []).map((a, i) => <li key={i}>{toText(a)}</li>)}
              </ul>
            </div>
          ))}
          {slackTechnical.length > 0 && (
            <div className="nb-slack-subsection">
              <h3 className="nb-subsection-title">Technical Discussions</h3>
              {slackTechnical.map((t, i) => (
                <div key={i} className="nb-discussion">
                  <span className="nb-discussion-topic">{t.topic}</span>
                  <p>{t.summary}</p>
                </div>
              ))}
            </div>
          )}
          {(kudosGiven.length > 0 || kudosReceived.length > 0) && (
            <div className="nb-kudos">
              {kudosReceived.length > 0 && (
                <div className="nb-kudos-section">
                  <h4 className="nb-subsection-title">Kudos Received</h4>
                  <ul className="nb-simple-list">
                    {kudosReceived.map((k, i) => <li key={i}><strong>{k.person}</strong>: {k.context}</li>)}
                  </ul>
                </div>
              )}
              {kudosGiven.length > 0 && (
                <div className="nb-kudos-section">
                  <h4 className="nb-subsection-title">Kudos Given</h4>
                  <ul className="nb-simple-list">
                    {kudosGiven.map((k, i) => <li key={i}><strong>{k.person}</strong>: {k.context}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {collapsibleSlackCount > 0 && (
            <CollapsibleSection title="More Conversations" expanded={expandedSections.slack} onToggle={() => toggleSection("slack")} count={collapsibleSlackCount}>
              {slackOperational.length > 0 && (
                <>
                  <h4 className="nb-subsection-title">Operational</h4>
                  <ul className="nb-simple-list">{slackOperational.map((s, i) => <li key={i}>{toText(s)}</li>)}</ul>
                </>
              )}
              {slackProcess.length > 0 && (
                <>
                  <h4 className="nb-subsection-title">Process</h4>
                  <ul className="nb-simple-list">{slackProcess.map((s, i) => <li key={i}>{toText(s)}</li>)}</ul>
                </>
              )}
              {slackNonWork.length > 0 && (
                <>
                  <h4 className="nb-subsection-title">Non-Work</h4>
                  <ul className="nb-simple-list">{slackNonWork.map((s, i) => <li key={i}>{toText(s)}</li>)}</ul>
                </>
              )}
              {slackDistractions.length > 0 && (
                <>
                  <h4 className="nb-subsection-title">Distractions</h4>
                  <ul className="nb-simple-list">{slackDistractions.map((s, i) => <li key={i}>{toText(s)}</li>)}</ul>
                </>
              )}
            </CollapsibleSection>
          )}
        </section>

        <SectionDivider />

        {/* Activity / Time Spent */}
        <section className="nb-section">
          <h2 className="nb-section-title">Time Spent</h2>
          <div className="nb-tally-row nb-meeting-tally-row">
            <div className="nb-tally nb-tally-accent">
              <span className="nb-tally-value">{formatHours(breakdownTotal.hours)}</span>
              <span className="nb-tally-label">{breakdownTotal.count} total</span>
            </div>
            {breakdownByCategory.filter((c) => c.count > 0).map((c) => (
              <div key={c.category} className={`nb-tally nb-tally-cat-${c.category.replace(":", "")}`}>
                <span className="nb-tally-value">{formatHours(c.hours)}</span>
                <span className="nb-tally-label">
                  <span className={`nb-meeting-cat nb-cat-${c.category.replace(":", "")}`}>{c.category}</span>
                  {" "}({c.count})
                </span>
              </div>
            ))}
          </div>

          {meetings.length > 0 && (
            <CollapsibleSection title="All Meetings" expanded={expandedSections.activity} onToggle={() => toggleSection("activity")} count={meetings.length}>
              {Object.entries(meetingsByDay).map(([day, dayMeetings]) => (
                <div key={day} className="nb-meeting-day">
                  <h4 className="nb-meeting-day-label">{day}</h4>
                  {dayMeetings.map((m, i) => (
                    <div key={i} className="nb-meeting-item">
                      <MeetingCategoryIcon category={m.category} />
                      <span className="nb-meeting-time">{(m.time || "").split(" ").slice(1).join(" ")}</span>
                      <span className="nb-meeting-title">{m.title}</span>
                      <span className="nb-meeting-duration">{m.durationMinutes}m</span>
                    </div>
                  ))}
                </div>
              ))}
            </CollapsibleSection>
          )}
        </section>

        {/* Scratch Notes */}
        {scratchNotes.length > 0 && (
          <>
            <SectionDivider />
            <section className="nb-section">
              <h2 className="nb-section-title">Scratch Notes</h2>
              <CollapsibleSection title="Research Notes" expanded={expandedSections.scratchNotes} onToggle={() => toggleSection("scratchNotes")} count={scratchNotes.length}>
                <div className="nb-scratch-cards">
                  {scratchNotes.map((sn, i) => (
                    <div key={i} className="nb-scratch-card">
                      <h3 className="nb-scratch-topic">{sn.topic}</h3>
                      <p className="nb-scratch-summary">{sn.summary}</p>
                      {(sn.sources || []).length > 0 && (
                        <div className="nb-scratch-sources">
                          {sn.sources.map((s, j) => <span key={j} className="nb-source-tag">{s}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            </section>
          </>
        )}

        <SectionDivider />

        {/* Growth Assessment */}
        <section className="nb-section nb-growth-section">
          <h2 className="nb-section-title">Growth Assessment</h2>
          <div className="nb-growth-grid">
            <GrowthStamp label="Incremental Delivery" signal={growth.incrementalDelivery} />
            <GrowthStamp label="Self Confidence" signal={growth.selfConfidence} />
            <GrowthStamp label="Systems Thinking" signal={growth.systemsThinking} />
            <GrowthStamp label="Execution" signal={growth.execution} />
          </div>
        </section>

        <div className="nb-footer">
          {meta.generatedAt && (
            <span>Generated {new Date(meta.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          )}
        </div>
      </div>
    </div>
  );
}
