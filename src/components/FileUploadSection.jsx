import { useState, useEffect } from 'react'
import { uploadFile, getRequestFiles, deleteFile, downloadFile } from '../services/api'

export default function FileUploadSection({ requestId, isEditable = true, onFileChange }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  // Load existing files when component mounts or requestId changes
  useEffect(() => {
    if (requestId) {
      loadFiles()
    }
  }, [requestId])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const response = await getRequestFiles(requestId)
      setFiles(response.files || [])
      setError('')
    } catch (err) {
      console.error('Error loading files:', err)
      setError('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return

    for (const file of selectedFiles) {
      try {
        setUploading(true)
        setUploadProgress(0)

        // Validate file
        if (file.size > 10 * 1024 * 1024) {
          setError('File size exceeds 10MB limit')
          continue
        }

        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]

        if (!allowedTypes.includes(file.type)) {
          setError(`File type not allowed: ${file.type}`)
          continue
        }

        // Upload file
        setUploadProgress(50)
        const response = await uploadFile(file, requestId)
        setUploadProgress(100)

        // Reload files
        await loadFiles()
        setError('')

        // Notify parent component
        if (onFileChange) {
          onFileChange()
        }

        // Reset input
        if (e.target) {
          e.target.value = ''
        }
      } catch (err) {
        console.error('Upload error:', err)
        setError(err.message || 'Failed to upload file')
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    }
  }

  const handleDownloadFile = async (fileName) => {
    try {
      await downloadFile(fileName, requestId)
    } catch (err) {
      console.error('Download error:', err)
      setError('Failed to download file: ' + (err.message || 'Unknown error'))
    }
  }

  const handleDeleteFile = async (fileName) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return
    }

    try {
      setLoading(true)
      await deleteFile(fileName, requestId)
      await loadFiles()

      if (onFileChange) {
        onFileChange()
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete file')
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase()
    const icons = {
      pdf: '📄',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      zip: '📦'
    }
    return icons[ext] || '📎'
  }

  const getOriginalFileName = (savedFileName) => {
    // savedFileName format: {uuid}_{originalName}
    const parts = savedFileName.split('_')
    if (parts.length > 1) {
      return parts.slice(1).join('_')
    }
    return savedFileName
  }

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">📎 Documents</h3>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Upload Section */}
      {isEditable && (
        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              disabled={uploading || loading}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            />
          Upload Files
          </label>

          {/* Upload Progress */}
          {uploading && uploadProgress > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}
        </div>
      )}

      {/* Files List */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">
          {files.length} {files.length === 1 ? 'File' : 'Files'} Attached
        </h4>

        {loading && <p className="text-gray-600">Loading files...</p>}

        {!loading && files.length === 0 && (
          <p className="text-gray-600 italic">No files attached yet</p>
        )}

        {!loading && files.length > 0 && (
          <div className="space-y-2">
            {files.map((fileName, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl">{getFileIcon(fileName)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium truncate" title={getOriginalFileName(fileName)}>
                      {getOriginalFileName(fileName)}
                    </p>
                    <p className="text-xs text-gray-500">File #{index + 1}</p>
                  </div>
                </div>

                <div className="flex gap-2 ml-2">
                  {/* Download Button */}
                  <button
                    onClick={() => handleDownloadFile(fileName)}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition disabled:opacity-50"
                    title="Download file"
                  >
                    ⬇️
                  </button>

                  {/* Delete Button */}
                  {isEditable && (
                    <button
                      onClick={() => handleDeleteFile(fileName)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition disabled:opacity-50"
                      title="Delete file"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info for Viewers */}
      {!isEditable && files.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          ✓ All files are visible to department approvers and employees
        </div>
      )}
    </div>
  )
}
