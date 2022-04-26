import { CustomSettingsContext } from "./context";
export const CustomSettingsProvider = (props) => {
    const { app } = props;

    // Create axios instance for authenticated request
    const authAxios = axios.create();

    // Intercept all requests on this axios instance
    authAxios.interceptors.request.use(async (config) => {
        const token = await getSessionToken(app);
        // Append your request headers with an authenticated token
        config.headers["Authorization"] = `Bearer ${token}`;
        return config;
    });

    // Emoji Options
    const [firstEmoji, setFirstEmoji] = useState(firstEmojiOptions[1])
    const [secondEmoji, setSecondEmoji] = useState(secondEmojiOptions[1])

    // Style Options
    const [backgroundColor, setBackgroundColor] = useState("#ffffff")
    const [backgroundColorRgb, setBackgroundColorRgb] = useState({ hue: 255, brightness: 255, saturation: 255 })
    const [selectionColor, setSelectionColor] = useState("#3678b4")
    const [selectionColorRgb, setSelectionColorRgb] = useState({ hue: 54, brightness: 120, saturation: 180 })
    const [strokeColor, setStrokeColor] = useState("#d9d9d9")
    const [strokeColorRgb, setStrokeColorRgb] = useState({ hue: 217, brightness: 217, saturation: 217 })
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [cornerRadius, setCornerRadius] = useState(2)

    // Text Options
    const [labelText, setLabelText] = useState("Send a tip directly to your fulfillment workers 💜")
    const [tooltipText, setTooltipText] = useState("HeyThanks is a service that delivers your tips directly to the fulfillment employees who pick, pack, and ship your order.")

    // Display Options
    const [displayStatus, setDisplayStatus] = useState('preview')

    return (
        <CustomSettingsContext.Provider
            value={[
                {
                    firstEmoji,
                    setFirstEmoji,
                    secondEmoji,
                    setSecondEmoji,
                    backgroundColor,
                    setBackgroundColor,
                    backgroundColorRgb,
                    setBackgroundColorRgb,
                    selectionColor,
                    setSelectionColor,
                    selectionColorRgb,
                    setSelectionColorRgb,
                    strokeColor,
                    setStrokeColor,
                    strokeColorRgb,
                    setStrokeColorRgb,
                    strokeWidth,
                    setStrokeWidth,
                    cornerRadius,
                    setCornerRadius,
                    labelText,
                    setLabelText,
                    tooltipText,
                    setTooltipText,
                    displayStatus,
                    setDisplayStatus,
                },
            ]}
        >
            {props.children}
        </CustomSettingsContext.Provider>
    );
};