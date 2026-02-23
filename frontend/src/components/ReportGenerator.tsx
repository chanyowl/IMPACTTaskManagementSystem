/**
 * Report Generator Component
 *
 * Provides UI for configuring, previewing, and exporting compliance reports.
 * Uses AI for narrative generation and audit logs for quantitative performance.
 */

import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import axios from 'axios';
import { getObjectives, type Objective, type TaskManagement } from '../services/taskManagementApi';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001') + '/api';

interface ReportGeneratorProps {
    // No props needed for standalone tab
}

const IMPACT_NXT_MEMBERS = [
    'Mica',
    'Crystelle',
    'Trixie',
    'Chan',
    'Josh'
];

const ADMIN_MEMBERS = [
    'Jon',
    'Dana',
    'Daniella'
];

const PEG_MEMBERS = [
    'Vanessa',
    'Elaine',
    'Cha'
];

const FULL_NAME_MAPPING: Record<string, string> = {
    'Mica': 'Mica Ella Figueroa',
    'Crystelle': 'Crystelle Jel Soriano',
    'Trixie': 'Trixie Aray',
    'Chan': 'Chrystian Perote',
    'Josh': 'Joshua Guico',
    'Jon': 'Jon Fernandez',
    'Dana': 'Dana Steffany Natiola',
    'Daniella': 'Daniella Guerrero',
    'Vanessa': 'Vanessa Malapit',
    'Elaine': 'Madielaine Fatallo',
    'Cha': 'Charity Bersalona'
};

const ASSIGNEE_ALIASES: Record<string, string> = {
    'Chan': 'Chan,Chrystian',
    'Josh': 'Josh,Joshua',
    'Jon': 'Jon,jon,doc Jon',
    'Dana': 'Dana,dana',
    'Daniella': 'Daniella,daniella,dani',
    'Vanessa': 'Vanessa,vanessa',
    'Elaine': 'Elaine,elaine,Madielaine,madielaine',
    'Cha': 'Cha,cha,Charity,charity'
};

export default function ReportGenerator({ }: ReportGeneratorProps) {
    const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'project' | 'dost'>('monthly');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [selectedObjective, setSelectedObjective] = useState<string>('');
    const [selectedAssignee, setSelectedAssignee] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [reportPreview, setReportPreview] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEditable, setIsEditable] = useState(false);

    // DOST Specific State - Removed as per user request for full automation

    useEffect(() => {
        const fetchObjectives = async () => {
            try {
                const data = await getObjectives();
                setObjectives(data);
            } catch (err) {
                console.error('Failed to fetch objectives:', err);
            }
        };
        fetchObjectives();
    }, []);

    // Clear preview when configuration changes to ensure exclusivity
    useEffect(() => {
        setReportPreview(null);
        setError(null);
        setError(null);
    }, [reportType, startDate, endDate, selectedObjective, selectedAssignee]);

    const getOfficerName = () => {
        if (selectedAssignee && FULL_NAME_MAPPING[selectedAssignee]) {
            return FULL_NAME_MAPPING[selectedAssignee];
        }
        if (selectedAssignee) {
            return selectedAssignee;
        }
        return 'Chrystian L. Perote';
    };



    const getOfficerPosition = () => {
        if (selectedAssignee) {
            switch (selectedAssignee) {
                // IMPACT NXT Team
                case 'Mica':
                case 'Crystelle':
                case 'Trixie':
                case 'Chan':
                case 'Josh':
                    return 'Project Technical Assistant II';

                // ADMIN Team
                case 'Jon':
                    return 'AIPO Director';
                case 'Dana':
                    return 'Administrative Assistant';
                case 'Daniella':
                    return 'Marketing Specialist';

                // PEG Team
                case 'Vanessa':
                    return 'Protection and Education Group, head';
                case 'Elaine':
                    return 'Research Officer III';
                case 'Cha':
                    return 'Research Officer';
            }
        }
        return 'Project Technical Assistant II'; // Default fallback
    };

    const handleGeneratePreview = async () => {
        setLoading(true);
        setError(null);
        try {
            // Check for aliases (e.g. Chan -> Chan,Chrystian)
            const assigneeQuery = ASSIGNEE_ALIASES[selectedAssignee] || selectedAssignee;

            if (reportType === 'dost') {
                const response = await axios.post(`${API_BASE_URL}/reports/preview`, {
                    type: reportType,
                    startDate,
                    endDate,
                    objectiveId: selectedObjective || undefined,
                    assignee: assigneeQuery || undefined,
                    // No manual inputs sent; backend will infer from dashboard data
                    dostInputs: {
                        // We still send basic context derived from selection, but no user-typed text
                        dateRange: `${new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} to ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                    }
                });
                setReportPreview(response.data.report);
            } else {
                const response = await axios.get(`${API_BASE_URL}/reports/preview`, {
                    params: {
                        type: reportType,
                        startDate,
                        endDate,
                        objectiveId: selectedObjective || undefined,
                        assignee: assigneeQuery || undefined
                    }
                });
                setReportPreview(response.data.report);
            }
        } catch (err: any) {
            console.error('Error generating preview:', err);
            setError(err.response?.data?.error || 'Failed to generate report preview');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('report-content');
        if (!element) return;

        setLoading(true);
        try {
            const officerName = getOfficerName().replace(/\s+/g, '_');
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `Accomplishment_Report_${officerName}_${dateStr}.pdf`;

            const opt = {
                margin: 0.5,
                filename: filename,
                image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error('PDF generation failed:', err);
            setError('Failed to generate PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        const element = document.getElementById('report-preview-content') || document.getElementById('report-content');
        if (!element) return;

        setLoading(true);
        try {
            // Create blobs for rich text copy
            const blob = new Blob([element.outerHTML], { type: 'text/html' });
            const textBlob = new Blob([element.innerText], { type: 'text/plain' });

            const item = new ClipboardItem({
                'text/html': blob,
                'text/plain': textBlob
            });

            await navigator.clipboard.write([item]);
            alert('Report copied to clipboard! You can now paste it into Google Docs with full formatting.');
        } catch (err: any) {
            console.error('Clipboard API failed:', err);
            // Fallback for older browsers
            try {
                const range = document.createRange();
                range.selectNode(element);
                const selection = window.getSelection();
                if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                    document.execCommand('copy');
                    selection.removeAllRanges();
                    alert('Report copied to clipboard! (Fallback method)');
                }
            } catch (fallbackErr) {
                console.error('Fallback copy failed:', fallbackErr);
                setError('Failed to copy to clipboard. Please select the text and copy manually.');
            }
        } finally {
            setLoading(false);
        }
    };

    const reportContent = useMemo(() => {
        if (!reportPreview) return null;

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {reportType !== 'dost' ? (
                    /* Strict Monthly Accomplishments Template */
                    <div
                        className={`bg-white p-8 md:p-12 shadow-lg border border-gray-200 mx-auto max-w-4xl ${isEditable ? 'outline-dashed outline-2 outline-indigo-500/30' : ''}`}
                        id="report-content"
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                    >
                        <h1 className="text-center font-bold text-xl mb-6 uppercase tracking-wide text-gray-900">Accomplishment Report</h1>

                        {/* Header Box */}
                        <div className="border-2 border-black grid grid-cols-1 md:grid-cols-2 print:grid-cols-2">
                            <div className="p-4 border-b-2 md:border-b-0 md:border-r-2 print:border-b-0 print:border-r-2 border-black">
                                <div className="font-bold text-sm mb-1">Officer: <span className="font-normal">{getOfficerName()}</span></div>
                                <div className="font-bold text-sm">Position: <span className="font-normal">{getOfficerPosition()}</span></div>
                            </div>
                            <div className="p-4 flex items-center">
                                <div className="font-bold text-sm">Period Covered: <span className="font-normal">
                                    {new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span></div>
                            </div>
                        </div>

                        {/* Content Table */}
                        <div className="border-x-2 border-b-2 border-black grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 min-h-[500px]">
                            {/* Planned Activities Column */}
                            <div className="border-b-2 md:border-b-0 md:border-r-2 print:border-b-0 print:border-r-2 border-black">
                                <div className="p-4 font-bold text-sm uppercase border-b-2 border-black h-16 flex items-center">
                                    Planned Activities / Outputs for the Period
                                </div>
                                <div className="p-6 text-sm text-gray-800">
                                    <ul className="list-disc pl-5 space-y-2">
                                        {(reportPreview.tasks || [])
                                            .filter((t: TaskManagement) => t.status === 'Pending')
                                            .map((task: TaskManagement) => (
                                                <li key={task.taskId}>
                                                    <span className="font-semibold block">{task.deliverable}</span>
                                                    {reportPreview.taskAccomplishments?.[task.taskId]?.length > 0 && (
                                                        <ul className="list-none pl-2 mt-1 space-y-1">
                                                            {reportPreview.taskAccomplishments[task.taskId].map((update: string, idx: number) => (
                                                                <li key={idx} className="text-xs text-gray-600 flex items-start">
                                                                    <span className="mr-1">-</span>
                                                                    <span>{update}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    {/* Ref: line removed as requested */}
                                                </li>
                                            ))}
                                        {(reportPreview.tasks || []).filter((t: TaskManagement) => t.status === 'Pending').length === 0 && (
                                            <li className="text-gray-500 italic">No pending or active tasks for this period.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Actual Accomplishments Column */}
                            <div>
                                <div className="p-4 font-bold text-sm uppercase border-b-2 border-black h-16 flex items-center">
                                    Actual Accomplishments and Other Remarks
                                </div>
                                <div className="p-6 text-sm text-gray-800">
                                    <div className="mb-8">
                                        <h4 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Completed Tasks</h4>
                                        <ul className="list-disc pl-5 space-y-2">
                                            {(reportPreview.tasks || [])
                                                .filter((t: TaskManagement) => t.status === 'Done')
                                                .map((task: TaskManagement) => (
                                                    <li key={task.taskId}>
                                                        <span className="font-semibold block">{task.deliverable}</span>
                                                        {reportPreview.taskAccomplishments?.[task.taskId]?.length > 0 && (
                                                            <ul className="list-none pl-2 mt-1 space-y-1">
                                                                {reportPreview.taskAccomplishments[task.taskId].map((update: string, idx: number) => (
                                                                    <li key={idx} className="text-xs text-gray-600 flex items-start">
                                                                        <span className="mr-1">-</span>
                                                                        <span>{update}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </li>
                                                ))}
                                            {(reportPreview.tasks || []).filter((t: TaskManagement) => t.status === 'Done').length === 0 && (
                                                <li className="text-gray-500 italic">No tasks completed in this period.</li>
                                            )}
                                        </ul>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Ongoing / Active Tasks</h4>
                                        <ul className="list-disc pl-5 space-y-2">
                                            {(reportPreview.tasks || [])
                                                .filter((t: TaskManagement) => t.status === 'Active')
                                                .map((task: TaskManagement) => (
                                                    <li key={task.taskId}>
                                                        <span className="font-semibold block">{task.deliverable}</span>
                                                        {reportPreview.taskAccomplishments?.[task.taskId]?.length > 0 && (
                                                            <ul className="list-none pl-2 mt-1 space-y-1">
                                                                {reportPreview.taskAccomplishments[task.taskId].map((update: string, idx: number) => (
                                                                    <li key={idx} className="text-xs text-gray-600 flex items-start">
                                                                        <span className="mr-1">-</span>
                                                                        <span>{update}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </li>
                                                ))}
                                            {(reportPreview.tasks || []).filter((t: TaskManagement) => t.status === 'Active').length === 0 && (
                                                <li className="text-gray-500 italic">No active tasks for this period.</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Thematic Analysis section removed as requested */}
                                </div>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="mt-16 grid grid-cols-2 gap-12">
                            <div className="text-center">

                                <div className="font-bold text-sm uppercase text-gray-900">{getOfficerName()}</div>
                                <div className="text-xs text-gray-600">{getOfficerPosition()}</div>
                            </div>
                            <div className="text-center mt-8 md:mt-0">

                                <div className="font-bold text-sm uppercase text-gray-900">Engr. Benjamin N. Mirasol</div>
                                <div className="text-xs text-gray-600">Project Leader</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Standard AI Narrative Section for other report types */
                    <div
                        className={`bg-white p-12 min-h-[11in] mx-auto shadow-lg print:shadow-none print:m-0 w-full max-w-[8.5in] ${isEditable ? 'outline-dashed outline-2 outline-indigo-500/30' : ''}`}
                        id="report-content"
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 uppercase border-b-2 border-black pb-4">
                            Professional Activity Narrative
                        </h3>


                        <div className="prose prose-slate max-w-none text-justify group-focus:outline-none leading-loose">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    table: ({ node, ...props }) => <table className="min-w-full border-collapse border border-gray-300 my-4" {...props} />,
                                    th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left font-bold" {...props} />,
                                    td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />
                                }}
                            >
                                {reportPreview.narrative}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        );
    }, [reportType, reportPreview, startDate, endDate, objectives, isEditable]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-sm flex flex-col border border-gray-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Compliance & Narrative Report</h2>
                        <p className="text-sm text-gray-500 mt-1">Generate audit-ready documentation and activity summaries for your stakeholders</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-100/50 px-3 py-1 rounded-full">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        AI-Powered Analysis
                    </div>
                </div>

                {/* Configuration Panel */}
                <div className="p-6 bg-gray-50 border-b border-gray-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-transform: uppercase tracking-wider">Report Type</label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value as any)}
                                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
                            >
                                <option value="monthly">Accomplishment Report</option>
                                <option value="dost">Quarterly Narrative Report</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-transform: uppercase tracking-wider">Project (Optional)</label>
                            <select
                                value={selectedObjective}
                                onChange={(e) => setSelectedObjective(e.target.value)}
                                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
                            >
                                <option value="">All Projects</option>
                                <option value="IMPACT NXT">IMPACT NXT</option>
                                <option value="STEP">STEP</option>
                                <option value="HEIRIT">HEIRIT</option>
                                <option value="Lab-In-a-Box">Lab-In-a-Box</option>
                                <option value="BlueNest">BlueNest</option>
                                <option value="CBIG">CBIG</option>
                                <option value="ISG">ISG</option>
                                <option value="PEG">PEG</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-transform: uppercase tracking-wider">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-transform: uppercase tracking-wider">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        {reportType === 'monthly' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 text-transform: uppercase tracking-wider">Task Owner (Optional)</label>
                                {selectedObjective === 'IMPACT NXT' || selectedObjective === 'ADMIN' || selectedObjective === 'PEG' ? (
                                    <select
                                        value={selectedAssignee}
                                        onChange={(e) => setSelectedAssignee(e.target.value)}
                                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
                                    >
                                        <option value="">All Members</option>
                                        {(selectedObjective === 'IMPACT NXT' ? IMPACT_NXT_MEMBERS : selectedObjective === 'ADMIN' ? ADMIN_MEMBERS : PEG_MEMBERS).map(member => (
                                            <option key={member} value={member}>{member}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={selectedAssignee}
                                        onChange={(e) => setSelectedAssignee(e.target.value)}
                                        placeholder="Enter assignee name..."
                                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                )}
                            </div>
                        )}
                    </div>


                    <div className="flex justify-end">
                        <button
                            onClick={handleGeneratePreview}
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap uppercase tracking-wider text-sm"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                    Generate Narrative
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 bg-white min-h-[500px]">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-3 animate-in fade-in">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Report Content - Document View */}
                    {reportContent || (
                        !loading && !error && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-20 animate-in fade-in">
                                <div className="bg-blue-50 p-8 rounded-full mb-6">
                                    <svg className="w-20 h-20 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-400 mb-2">Ready to compile?</h3>
                                <p className="text-gray-400 max-w-sm text-center">Select your reporting period and type above, then click generate to produce an AI-assisted compliance summary.</p>
                            </div>
                        )
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 bg-white flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Audit-Ready State</p>
                            <p className="text-xs text-gray-500">Immutable trailing logs verified and ready</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsEditable(!isEditable)}
                            disabled={!reportPreview}
                            className={`px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${isEditable
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-200 shadow-inner"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {isEditable ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Disable Editing
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Enable Editing
                                </>
                            )}
                        </button>
                        <button
                            onClick={reportType === 'monthly' ? handleDownloadPDF : handleCopy}
                            disabled={!reportPreview || loading}
                            className="px-8 py-4 bg-indigo-950 text-white rounded-2xl hover:bg-black font-black uppercase tracking-widest text-xs transition-all shadow-xl hover:shadow-indigo-900/40 disabled:opacity-30 flex items-center gap-3 active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>{reportType === 'monthly' ? 'Downloading...' : 'Copying...'}</span>
                                </>
                            ) : (
                                <>
                                    {reportType === 'monthly' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                    )}
                                    {reportType === 'monthly' ? 'Download PDF' : 'Copy to Clipboard'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
