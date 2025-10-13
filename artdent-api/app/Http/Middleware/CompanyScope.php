<?php

namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// app/Http/Middleware/CompanyScope.php
class CompanyScope {
  public function handle($request, Closure $next){
    if($u = $request->user()){
      // Inyecta company_id al request para store/update
      if($request->isMethod('post') || $request->isMethod('put') || $request->isMethod('patch')){
        $request->merge(['company_id'=>$u->company_id]);
      }
      // Eloquent global scope opcional
      Model::macro('forCompany', fn($cid) => $this->where('company_id',$cid));
    }
    return $next($request);
  }
}
// bootstrap/app.php -> withMiddleware() agrega CompanyScope a api

