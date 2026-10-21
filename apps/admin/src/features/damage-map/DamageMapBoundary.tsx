import { Component } from 'react'
import type { ReactNode } from 'react'

export class DamageMapBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="panel map-fallback" role="alert">
          <h2>Harita açılamadı</h2>
          <p>Bağlantınızı kontrol edip sayfayı yenileyin. Diğer panel bölümlerini kullanmaya devam edebilirsiniz.</p>
          <button type="button" className="primary-button" onClick={() => window.location.reload()}>Sayfayı yenile</button>
        </section>
      )
    }
    return this.props.children
  }
}
