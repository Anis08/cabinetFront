import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from './UI/Button'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            
            <h1 className="text-lg font-semibold text-gray-900 mb-2">
              Une erreur s'est produite
            </h1>
            
            <p className="text-gray-600 mb-6">
              L'application a rencontré une erreur inattendue. Veuillez recharger la page ou contacter le support si le problème persiste.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="text-left mb-6">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Détails de l'erreur (développement)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-red-600 overflow-auto max-h-32">
                  <div>{this.state.error.toString()}</div>
                  {this.state.errorInfo.componentStack && (
                    <div className="mt-2 text-gray-600">
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="space-y-3">
              <Button
                onClick={this.handleReload}
                variant="primary"
                fullWidth
                icon={RefreshCw}
              >
                Recharger la page
              </Button>
              
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                fullWidth
              >
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary