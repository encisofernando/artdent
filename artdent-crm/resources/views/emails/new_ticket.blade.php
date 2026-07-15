@extends('emails._layout')

@section('title', 'Nuevo ticket de soporte')

@section('content')
  <h1 style="margin:0 0 8px;font-size:22px;color:#397B9C;">Nuevo ticket de soporte</h1>
  <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6;">
    <strong>{{ $ticket->tenant_name ?? $ticket->tenant_id }}</strong> abrió el ticket
    <strong>#{{ $ticket->id }} · {{ $ticket->subject }}</strong>
    (categoría: {{ $ticket->category }}, prioridad: {{ $ticket->priority }}).
  </p>

  <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.6;">
    De: {{ $ticket->created_by_name }} ({{ $ticket->created_by_email }})
  </p>

  <p style="text-align:center;margin:0 0 28px;">
    <a href="{{ rtrim(config('app.support_admin_url'), '/') }}/tickets/{{ $ticket->id }}"
       style="display:inline-block;background:#397B9C;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
      Ver en el panel de ArtCode
    </a>
  </p>
@endsection
