import { Button } from "@shopify/polaris";
import { AddCodeMajor } from "@shopify/polaris-icons";
import { useSettings } from "../../../state/settings/context";
import { useShop } from "../../../state/shop/context";

const InstallButton = () => {
    const [{
        disableButtons,
        setDisableButtons,
    }] = useSettings();
    const [{ createScriptTag }] = useShop();

    return (
        <Button
            icon={AddCodeMajor}
            loading={disableButtons}
            size="large"
            onClick={async () => {
                setDisableButtons(true);
                // Create script tag
                const scriptTag = await createScriptTag({
                    variables: {
                        input: {
                            src: `${HOST}/scripts/tips-widget.js`,
                            displayScope: "ALL"
                        }
                    }
                }).catch(err => console.log(err));
                console.log(scriptTag);
                setDisableButtons(false);
            }}
        >
            Install ScriptTag
        </Button>
    );
};

export default InstallButton;
