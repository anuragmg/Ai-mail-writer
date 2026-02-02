import { useState, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from "@mui/material";

function App() {
  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const controllerRef = useRef(null);

  const handleSubmit = async () => {
    // 🔒 Prevent duplicate clicks
    if (isLoading) return;

    // 🧹 Prevent empty submits
    if (!emailContent.trim()) return;

    setIsLoading(true);
    setError("");
    setGeneratedReply("");

    // ❌ Abort previous request if any
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();

    try {
      // ⏱ Small delay to avoid burst traffic
      await new Promise(resolve => setTimeout(resolve, 1200));

      const response = await fetch("http://localhost:8080/api/email/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailContent: emailContent.trim(),
          tone,
        }),
        signal: controllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedReply(data.reply);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Email Reply Generator
      </Typography>

      <Box sx={{ mx: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          label="Original Email Content"
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{ mb: 3 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tone (Optional)</InputLabel>
          <Select
            value={tone}
            label="Tone (Optional)"
            onChange={(e) => setTone(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="Casual">Casual</MenuItem>
            <MenuItem value="Friendly">Friendly</MenuItem>
            <MenuItem value="Professional">Professional</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!emailContent.trim() || isLoading}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} /> : "Generate Reply"}
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {generatedReply && (
        <Box
          sx={{
            mt: 4,
            p: 2,
            border: "1px solid #ccc",
            borderRadius: 2,
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Generated Reply:
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={generatedReply}
            InputProps={{ readOnly: true }}
          />

          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => navigator.clipboard.writeText(generatedReply)}
          >
            Copy to Clipboard
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default App;
