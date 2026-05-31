import './globals.css'

export const metadata = {
  title: 'Gestor de Tareas',
  description: 'Aplicación CRUD de tareas con Next.js 14 y Amazon DynamoDB',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
