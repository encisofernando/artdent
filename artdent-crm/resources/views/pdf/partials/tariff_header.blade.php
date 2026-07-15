<div style="width: 100%; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; position: relative;">
    <table style="width: 100%; border-collapse: collapse; background: linear-gradient(115deg, #397B9C 0%, #49949C 50%, #5AAD9C 100%);">
        <tr>
            <td style="width: 40mm; padding: 6mm 0 6mm 14mm; vertical-align: middle;">
                @if($logoSrc)
                    <div style="background: #fff; border-radius: 6px; padding: 3px 10px; display: inline-block; line-height: 0;">
                        <img src="{{ $logoSrc }}" style="height: 11mm; display: block;">
                    </div>
                @else
                    <div style="color: #fff; font-weight: 800; font-size: 13px;">{{ $company->fantasy_name ?? $company->name }}</div>
                @endif
            </td>
            <td style="padding: 6mm 0; text-align: center; vertical-align: middle; color: #fff; font-size: 8px; font-weight: 600; letter-spacing: .02em; line-height: 1.7;">
                @if($contactLine1){{ $contactLine1 }}<br>@endif
                @if($contactLine2)Tel./Cel.: {{ $contactLine2 }}@endif
            </td>
            <td style="width: 44mm; padding: 6mm 14mm 6mm 0; text-align: right; vertical-align: middle; color: #fff;">
                <div style="font-size: 16px; font-weight: 800; letter-spacing: .06em;">ARANCEL</div>
                <div style="font-size: 8px; font-weight: 700; letter-spacing: .12em; opacity: .92;">{{ $monthLabel }}</div>
            </td>
        </tr>
    </table>
</div>
