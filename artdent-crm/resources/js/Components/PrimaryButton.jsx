export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-[#397B9C] px-4 py-2.5 text-sm font-semibold text-white transition duration-150 ease-in-out hover:bg-[#2D6585] focus:outline-none focus:ring-2 focus:ring-[#397B9C] focus:ring-offset-2 active:bg-[#245574] min-h-[40px] ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
