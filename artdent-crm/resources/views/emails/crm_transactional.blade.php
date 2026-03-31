@extends('emails._layout')

@section('title', $resolvedSubject)

@section('content')
  <div style="font-size:15px;color:#444;line-height:1.7;">
    {!! nl2br(e($resolvedBody)) !!}
  </div>
@endsection
